class Api::V1::SubmissionsController < ApplicationController
  before_action :authorized
  require 'open3'
  require 'tempfile'
  require 'bigdecimal'

  def index
    @submissions = current_user.submissions
    render json: @submissions
  end

  def create
    @submission = current_user.submissions.build(submission_params)
    problem = Problem.find(submission_params[:problem_id])

    if problem.judge&.casecmp?('kattis')
      # Create a temporary file to hold the code
      identifier = (problem.judge_identifier.presence || problem.title).to_s
      kattis_identifier = identifier.strip.downcase
      tempfile_basename = identifier.gsub(/[^0-9A-Za-z_\-]/, '_')
      tempfile_extension = language_extension(@submission.language)

      Tempfile.create([tempfile_basename, tempfile_extension]) do |file|
        file.write(@submission.code)
        file.close

        # Construct the command
        command = [
          "#{Rails.root}/.venv/bin/python",
          "#{Rails.root}/submit_kattis.py",
          '-p', kattis_identifier,
          '-l', @submission.language,
          '--force',
          file.path
        ]

        # Execute the command
        stdout, stderr, status = Open3.capture3(*command)

        if status.success?
          submission_id = stdout[/Submission ID:\s*(\d+)/i, 1]
          submission_url = stdout[/Submission URL:\s*(https?:\/\/\S+)/i, 1]

          if submission_id && submission_url
            @submission.kattis_submission_id = submission_id.to_i
            @submission.kattis_submission_url = submission_url

            parsed_status, parsed_time = parse_kattis_result(stdout)
            @submission.status = parsed_status
            @submission.execution_time = parsed_time if parsed_time
          else
            @submission.status = 'Submission Failed'
            Rails.logger.error "Kattis submission parse failed"
            Rails.logger.error "Kattis stdout: #{stdout}"
            Rails.logger.error "Kattis stderr: #{stderr}"
          end
        else
          @submission.status = 'Execution Error'
          # Log the error for debugging
          Rails.logger.error "Kattis script execution failed: #{stderr}"
        end
      end
    else
      # For now, if it's not a Kattis problem, we just save it.
      # Later, we can add logic for other judges.
      @submission.status = 'Pending'
    end

    if @submission.save
      render json: @submission, status: :created
    else
      render json: @submission.errors, status: :unprocessable_entity
    end
  end

  private

  def language_extension(language)
    map = {
      'C' => '.c',
      'C++' => '.cpp',
      'C++17' => '.cpp',
      'C++20' => '.cpp',
      'C#' => '.cs',
      'Go' => '.go',
      'Java' => '.java',
      'Java 17' => '.java',
      'JavaScript' => '.js',
      'JavaScript (Node.js)' => '.js',
      'Kotlin' => '.kt',
      'Python' => '.py',
      'Python 2' => '.py',
      'Python 3' => '.py',
      'Rust' => '.rs',
      'Ruby' => '.rb',
      'TypeScript' => '.ts'
    }

    map.fetch(language, '.txt')
  end

  def parse_kattis_result(output)
    cleaned_lines = output.to_s
                          .split("\n")
                          .flat_map { |line| strip_ansi(line).split(/\r/) }
                          .map(&:strip)
                          .reject(&:blank?)

    return ['Submitted', nil] if cleaned_lines.empty?

    final_line = cleaned_lines.reverse.find do |line|
      line.match?(/Accepted|Wrong Answer|Time Limit|Runtime|Compilation|Judge Error|Submission|Error/i)
    end || cleaned_lines.last

    status = final_line
    execution_time = nil

    if final_line =~ /(.*?)(?:\s*\(([^)]*)\))?$/
      status = Regexp.last_match(1).strip.presence || 'Submitted'
      details = Regexp.last_match(2)

      if details
        details.split(',').map(&:strip).each do |fragment|
          next unless fragment.match?(/[\d.,]+\s*[sS]/)

          numeric = fragment.match(/([\d.,]+)/)&.[](1)
          execution_time = numeric.tr(',', '.').to_f if numeric
          break
        end
      end
    end

    [status, execution_time]
  end

  def strip_ansi(value)
    value.to_s.gsub(/\e\[[0-9;]*m/, '').tr("\u00A0\u202F", '  ')
  end

  def submission_params
    params.require(:submission).permit(:problem_id, :language, :code, :status, :kattis_submission_id, :kattis_submission_url)
  end
end
