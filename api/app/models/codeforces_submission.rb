class CodeforcesSubmission < ApplicationRecord
  belongs_to :user
  belongs_to :codeforces_problem

  scope :accepted, -> { where(verdict: 'OK') }
end
