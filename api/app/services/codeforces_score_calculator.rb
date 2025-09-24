class CodeforcesScoreCalculator
  def self.calculate_for_user(user)
    new(user).calculate
  end

  def initialize(user)
    @user = user
  end

  def calculate
    unique_solved_problems = @user.codeforces_submissions.select('DISTINCT ON (codeforces_problem_id) * ')
    total_score = unique_solved_problems.joins(:codeforces_problem).sum('codeforces_problems.rating / 10')
    
    # Here you might want to decide how to store this score.
    # For now, let's just return it.
    total_score
  end
end
