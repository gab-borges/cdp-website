class Api::V1::SubmissionsController < ApplicationController
  before_action :authorized

  def index
    @submissions = current_user.submissions
    render json: @submissions
  end

  def create
    submission = current_user.submissions.build(submission_params)
    submission.status = 'processing'
    submission.kattis_submission_id = nil
    submission.kattis_submission_url = nil
    submission.execution_time = nil

    if submission.save
      ProcessSubmissionJob.perform_later(submission.id)
      render json: submission, status: :created
    else
      render json: { errors: submission.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def submission_params
    params.require(:submission).permit(:problem_id, :language, :code)
  end
end
