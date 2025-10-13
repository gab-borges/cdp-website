class User < ApplicationRecord
  has_secure_password
  has_many :submissions, dependent: :destroy
  has_many :codeforces_submissions, dependent: :destroy
  has_many :feed_posts, dependent: :destroy
  has_many :materials, dependent: :destroy

  before_validation :normalize_email
  before_validation :normalize_username
  after_commit :queue_initial_confirmation_email, on: :create

  enum :role, { member: 0, admin: 1 }, default: :member, prefix: true

  CONFIRMATION_TOKEN_VALID_FOR = 5.minutes
  CONFIRMATION_RESEND_WINDOW = 1.minute
  CONFIRMATION_PRUNE_DEFAULT_DAYS = 7

  scope :unconfirmed, -> { where(confirmed_at: nil) }

  validates :password, length: { minimum: 8, maximum: 128 }, if: :password_digest_changed?

  # Validations
  validates :username, presence: true, length: { maximum: 64 },
                       format: { with: /\A[a-z0-9_]+\z/, message: 'can only contain lowercase letters, numbers, and underscores' },
                       uniqueness: { case_sensitive: false, message: 'already taken' }
  validates :email, presence: true, uniqueness: { case_sensitive: false, message: 'already registered' },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :score, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :codeforces_score, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :bio, length: { maximum: 1200 }, allow_blank: true
  validates :codeforces_handle, length: { maximum: 60 }, allow_blank: true

  def total_score
    (score || 0) + (codeforces_score || 0)
  end

  def confirmed?
    confirmed_at.present?
  end

  def confirmation_token_valid?
    confirmation_sent_at.present? && confirmation_sent_at >= CONFIRMATION_TOKEN_VALID_FOR.ago
  end

  def confirm!
    update!(confirmed_at: Time.current, confirmation_token: nil)
  end

  def regenerate_confirmation_code!
    code = format("%06d", SecureRandom.random_number(1_000_000))
    digest = BCrypt::Password.create(code)
    update_columns(
      confirmation_token: digest,
      confirmation_sent_at: Time.current,
      updated_at: Time.current
    )
    code
  end

  def valid_confirmation_code?(code)
    return false if confirmation_token.blank?

    BCrypt::Password.new(confirmation_token).is_password?(code)
  rescue BCrypt::Errors::InvalidHash
    false
  end

  def self.confirmation_prune_threshold
    days = ENV.fetch('UNCONFIRMED_RETENTION_DAYS', CONFIRMATION_PRUNE_DEFAULT_DAYS).to_i
    days = CONFIRMATION_PRUNE_DEFAULT_DAYS if days <= 0
    days.days.ago
  end

  def self.prunable_unconfirmed
    cutoff = confirmation_prune_threshold
    unconfirmed.where('confirmation_sent_at IS NULL OR confirmation_sent_at < ?', cutoff)
  end

  def send_confirmation_instructions(force: false)
    return if confirmed?
    if !force && confirmation_sent_at.present? && confirmation_sent_at > CONFIRMATION_RESEND_WINDOW.ago
      return
    end

    code = regenerate_confirmation_code!
    UserMailer.confirmation_email(self, code: code).deliver_later
  end

  def monthly_score
    now = Time.current
    beginning_of_month = now.beginning_of_month
    end_of_month = now.end_of_month

    kattis_monthly_score = submissions
      .accepted
      .where(created_at: beginning_of_month..end_of_month)
      .joins(:problem)
      .sum('problems.points')

    codeforces_monthly_score = codeforces_submissions
      .where(submitted_at: beginning_of_month..end_of_month)
      .joins(:codeforces_problem)
      .sum('codeforces_problems.rating / 10')

    kattis_monthly_score + codeforces_monthly_score
  end

  def solved_problems_count
    submissions.accepted.select(:problem_id).distinct.count
  end

  def codeforces_solved_problems_count
    codeforces_submissions.accepted.select(:codeforces_problem_id).distinct.count
  end

  def total_solved_problems_count
    solved_problems_count + codeforces_solved_problems_count
  end

  private

  def queue_initial_confirmation_email
    send_confirmation_instructions(force: true)
  end

  def queue_initial_confirmation_email
    send_confirmation_instructions(force: true)
  end

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end

  def normalize_username
    return unless username.present?

    normalized = username.to_s.strip.downcase
    normalized = normalized.gsub(/\s+/, '_')
    normalized = normalized.gsub(/[^a-z0-9_]/, '_')
    normalized = normalized.gsub(/_{2,}/, '_')
    normalized = normalized.gsub(/\A_+|_+\z/, '')
    self.username = normalized.presence
  end
end
