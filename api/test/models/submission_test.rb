require "test_helper"
require "securerandom"

class SubmissionTest < ActiveSupport::TestCase
  self.use_transactional_tests = false

  setup do
    super
    Submission.delete_all
    Problem.delete_all
    User.delete_all
  end

  teardown do
    Submission.delete_all
    Problem.delete_all
    User.delete_all
    super
  end

  test "increments score and solver count on first accepted submission" do
    user = build_user(email: "solver-#{SecureRandom.hex(3)}@example.com")
    problem = build_problem(points: 75)

    Submission.create!(user:, problem:, status: "Accepted")

    user.reload
    problem.reload

    assert_equal 75, user.score
    assert_equal 1, problem.solvers_count
    assert_equal 1, user.solved_problems_count
  end

  test "does not double count when user resubmits accepted solution" do
    user = build_user(email: "repeat-#{SecureRandom.hex(3)}@example.com")
    problem = build_problem(points: 42)

    Submission.create!(user:, problem:, status: "Accepted")
    Submission.create!(user:, problem:, status: "Accepted")

    user.reload
    problem.reload

    assert_equal 42, user.score
    assert_equal 1, problem.solvers_count
    assert_equal 1, user.solved_problems_count
  end

  test "ignores non accepted submissions for scoring" do
    user = build_user(email: "pending-#{SecureRandom.hex(3)}@example.com")
    problem = build_problem(points: 30)

    Submission.create!(user:, problem:, status: "Wrong Answer")

    user.reload
    problem.reload

    assert_equal 0, user.score
    assert_equal 0, problem.solvers_count
    assert_equal 0, user.solved_problems_count
  end

  test "awards points when status transitions from pending to accepted" do
    user = build_user(email: "transition-#{SecureRandom.hex(3)}@example.com")
    problem = build_problem(points: 60)

    submission = Submission.create!(user:, problem:, status: "Pending")
    user.reload
    problem.reload

    assert_equal 0, user.score
    assert_equal 0, problem.solvers_count
    assert_equal 0, user.solved_problems_count

    submission.update!(status: "Accepted")

    user.reload
    problem.reload

    assert_equal 60, user.score
    assert_equal 1, problem.solvers_count
    assert_equal 1, user.solved_problems_count
  end

  private

  def build_user(attrs = {})
    defaults = {
      name: "Tester",
      email: "tester-#{SecureRandom.hex(4)}@example.com",
      password: "secret123",
      password_confirmation: "secret123"
    }
    User.create!(defaults.merge(attrs))
  end

  def build_problem(attrs = {})
    defaults = {
      title: "Problem #{SecureRandom.hex(4)}",
      points: 50,
      difficulty: "Médio"
    }
    Problem.create!(defaults.merge(attrs))
  end
end
