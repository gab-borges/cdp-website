# frozen_string_literal: true

class ProcessSubmissionJob < ApplicationJob
  queue_as :default

  def perform(submission_id)
    submission = Submission.find_by(id: submission_id)
    return unless submission

    problem = submission.problem
    unless problem
      submission.update(status: 'submission failed')
      return
    end

    if problem.judge&.casecmp?('kattis')
      process_kattis_submission(submission, problem)
    else
      submission.update(status: 'pending')
    end
  rescue StandardError => error
    Rails.logger.error("ProcessSubmissionJob failed for submission #{submission_id}: #{error.class} - #{error.message}")
    Rails.logger.error(error.backtrace.join("\n")) if error.backtrace
    submission&.update(status: 'execution error')
  end

  private

  def process_kattis_submission(submission, problem)
    require 'open3'
    require 'tempfile'

    identifier = (problem.judge_identifier.presence || problem.title).to_s
    kattis_identifier = identifier.strip.downcase
    tempfile_basename = identifier.gsub(/[^0-9A-Za-z_\-]/, '_').presence || 'submission'
    tempfile_extension = language_extension(submission.language)

    Tempfile.create([tempfile_basename, tempfile_extension]) do |file|
      file.write(submission.code)
      file.close

      command = [
        "#{Rails.root}/.venv/bin/python",
        "#{Rails.root}/submit_kattis.py",
        '-p', kattis_identifier,
        '-l', submission.language,
        '--force',
        file.path
      ]

      stdout, stderr, status = Open3.capture3(*command)

      if status.success?
        apply_kattis_success(submission, stdout, stderr)
      else
        submission.update(status: 'execution error')
        Rails.logger.error "Kattis script execution failed (submission #{submission.id}): #{stderr}"
      end
    end
  end

  def apply_kattis_success(submission, stdout, stderr)
    submission_id = stdout[/Submission ID:\s*(\d+)/i, 1]
    submission_url = stdout[/Submission URL:\s*(https?:\/\/\S+)/i, 1]

    unless submission_id && submission_url
      submission.update(status: 'submission failed')
      Rails.logger.error "Kattis submission parse failed for submission #{submission.id}"
      Rails.logger.error "Kattis stdout: #{stdout}"
      Rails.logger.error "Kattis stderr: #{stderr}"
      return
    end

    status_label, execution_time = parse_kattis_result(stdout)
    attributes = {
      kattis_submission_id: submission_id.to_i,
      kattis_submission_url: submission_url,
      status: status_label
    }
    attributes[:execution_time] = execution_time if execution_time

    submission.update(attributes)
  end

  def language_extension(language)
    {
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
    }.fetch(language, '.txt')
  end

  def parse_kattis_result(output)
    cleaned_lines = output.to_s
                          .split("\n")
                          .flat_map { |line| strip_ansi(line).split(/\r/) }
                          .map(&:strip)
                          .reject(&:blank?)

    return ['submitted', nil] if cleaned_lines.empty?

    final_line = cleaned_lines.reverse.find do |line|
      line.match?(/Accepted|Wrong Answer|Time Limit|Runtime|Compilation|Judge Error|Submission|Error/i)
    end || cleaned_lines.last

    status = final_line
    execution_time = nil

    if final_line =~ /(.*?)(?:\s*\(([^)]*)\))?$/
      status = Regexp.last_match(1).strip.presence || 'submitted'
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
end
