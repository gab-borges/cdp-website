if defined?(SolidQueue::RecurringTask)
  SolidQueue::RecurringTask.create_or_find_by!(key: 'cleanup_unconfirmed_users') do |task|
    task.cron = ENV.fetch('UNCONFIRMED_CLEANUP_CRON', '0 3 * * *')
    task.job_class = 'CleanupUnconfirmedUsersJob'
  end
end
