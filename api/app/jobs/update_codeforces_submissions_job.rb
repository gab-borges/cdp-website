class UpdateCodeforcesSubmissionsJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    user = User.find(user_id)
    return unless user.codeforces_handle.present?

    submissions = CodeforcesClient.fetch_submissions(user.codeforces_handle)
    process_submissions(user, submissions)
  end

  private

  def process_submissions(user, submissions)
    submissions.each do |sub|
      next unless sub['verdict'] == 'OK'

      problem_data = sub['problem']
      # Some problems on Codeforces might not have a rating (e.g., from old contests)
      next unless problem_data['rating'].present?

      problem = find_or_create_problem(problem_data)
      find_or_create_submission(user, problem, sub)
    end

    new_score = CodeforcesScoreCalculator.calculate_for_user(user)
    user.update!(codeforces_score: new_score)
  end

  def find_or_create_problem(problem_data)
    problem = CodeforcesProblem.find_or_initialize_by(
      contest_id: problem_data['contestId'],
      problem_index: problem_data['index']
    )

    if problem.new_record?
      problem.name = problem_data['name']
      problem.rating = problem_data['rating']
      problem.tags = problem_data['tags']
      problem.save!
    end

    problem
  end

  def find_or_create_submission(user, problem, sub)
    # Using find_or_create_by to avoid duplicates
    CodeforcesSubmission.find_or_create_by(
      user: user,
      codeforces_problem: problem
    ) do |submission|
      submission.submitted_at = Time.at(sub['creationTimeSeconds'])
      submission.verdict = sub['verdict']
    end
  end
end
