class CleanupUnconfirmedUsersJob < ApplicationJob
  queue_as :default

  def perform
    prunable = User.prunable_unconfirmed
    return if prunable.blank?

    prunable.find_each(batch_size: 100) do |user|
      Rails.logger.info("[CleanupUnconfirmedUsersJob] Deleting unconfirmed user ##{user.id} (#{user.email})")
      user.destroy!
    end
  end
end
