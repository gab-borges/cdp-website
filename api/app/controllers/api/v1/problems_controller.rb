class Api::V1::ProblemsController < ApplicationController
  def index
    @problems = Problem.all
    render json: @problems
  end

  def show
    @problem = Problem.find(params[:id])
    render json: @problem
  end

  def create
    @problem = Problem.new(problem_params)
    if @problem.save
      render json: @problem, status: :created
    else
      render json: @problem.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @problem = Problem.find(params[:id])
    @problem.destroy
    head :no_content
  end

  private

  def problem_params
    params.require(:problem).permit(:title, :description, :difficulty, :points, :judge, :judge_identifier)
  end
end
