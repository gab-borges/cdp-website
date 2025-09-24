class User < ApplicationRecord
  has_secure_password
  has_many :submissions, dependent: :destroy
  has_many :codeforces_submissions, dependent: :destroy
  has_many :feed_posts, dependent: :destroy
  has_many :materials, dependent: :destroy

  before_validation :normalize_email
  before_validation :normalize_username

  enum :role, { member: 0, admin: 1 }, default: :member, prefix: true

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

  private

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
