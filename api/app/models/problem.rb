class Problem < ApplicationRecord
  has_many :submissions, dependent: :destroy
  has_many :solvers, -> { distinct }, through: :submissions, source: :user

  def increment_solvers_count!
    with_lock { increment!(:solvers_count) }
  end
end
