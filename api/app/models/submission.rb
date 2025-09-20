class Submission < ApplicationRecord
  ACCEPTED_STATUS = 'accepted'.freeze

  belongs_to :user
  belongs_to :problem

  scope :accepted, -> { where('LOWER(TRIM(status)) = ?', ACCEPTED_STATUS) }

  after_save :flag_award_if_needed
  after_commit :apply_scoring!, if: :award_on_commit?

  def accepted?
    status.to_s.strip.casecmp?(ACCEPTED_STATUS)
  end

  private

  def apply_scoring!
    return unless award_on_commit?
    return unless accepted?
    return if solved_before?

    ApplicationRecord.transaction do
      user.with_lock { user.increment!(:score, problem_points) }
      problem.increment_solvers_count!
    end
  rescue ActiveRecord::ActiveRecordError => error
    Rails.logger.error("Submission scoring failed for submission #{id}: #{error.class} - #{error.message}")
  ensure
    @award_on_commit = false
  end

  def solved_before?
    user.submissions
        .accepted
        .where(problem_id: problem_id)
        .where.not(id: id)
        .exists?
  end

  def problem_points
    problem&.points.to_i
  end

  def flag_award_if_needed
    @award_on_commit = just_became_accepted?
  end

  def award_on_commit?
    @award_on_commit
  end

  def just_became_accepted?
    return false unless accepted?
    return false unless saved_change_to_status?

    previous_status, = saved_change_to_status
    !status_value_accepted?(previous_status)
  end

  def status_value_accepted?(value)
    value.to_s.strip.casecmp?(ACCEPTED_STATUS)
  end
end
