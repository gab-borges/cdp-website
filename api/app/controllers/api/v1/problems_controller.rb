class Api::V1::ProblemsController < ApplicationController
  before_action :set_problem, only: [:show, :update, :destroy]
  before_action :require_admin!, only: [:create, :update, :destroy]

  def index
    problems = Problem.order(created_at: :desc)
    render json: problems
  end

  def show
    render json: @problem
  end

  def create
    problem = Problem.new(problem_params)
    if problem.save
      render json: problem, status: :created
    else
      render json: { errors: problem.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @problem.update(problem_params)
      render json: @problem
    else
      render json: { errors: @problem.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @problem.destroy
    head :no_content
  end

  private

  def set_problem
    @problem = Problem.find(params[:id])
  end

  def problem_params
    params.require(:problem).permit(:title, :description, :difficulty, :points, :judge, :judge_identifier)
  end
end
