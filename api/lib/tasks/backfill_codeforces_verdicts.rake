namespace :db do
  desc "Backfill verdicts for existing Codeforces submissions"
  task backfill_codeforces_verdicts: :environment do
    CodeforcesSubmission.where(verdict: nil).find_each do |submission|
      begin
        user = submission.user
        problem = submission.codeforces_problem
        submissions = CodeforcesClient.fetch_submissions(user.codeforces_handle)
        
        api_submission = submissions.find do |s|
          s['problem']['contestId'] == problem.contest_id && s['problem']['index'] == problem.problem_index
        end
        
        if api_submission
          submission.update!(verdict: api_submission['verdict'])
          puts "Updated submission #{submission.id} with verdict #{api_submission['verdict']}"
        else
          puts "Could not find submission for problem #{problem.contest_id}#{problem.problem_index} for user #{user.codeforces_handle}"
        end
      rescue => e
        puts "Error updating submission #{submission.id}: #{e.message}"
      end
    end
  end
end
