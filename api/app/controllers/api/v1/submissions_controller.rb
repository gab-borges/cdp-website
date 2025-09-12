class Api::V1::SubmissionsController < ApplicationController
  before_action :authenticate_user!

  def index
    @submissions = current_user.submissions
    render json: @submissions
  end

  def create
    @submission = current_user.submissions.build(submission_params)

    if @submission.save
      render json: @submission, status: :created
    else
      render json: @submission.errors, status: :unprocessable_entity
    end
  end

  private

  def submission_params
    params.require(:submission).permit(:problem_id, :language, :code, :status)
  end
end
