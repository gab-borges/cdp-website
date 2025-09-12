class Api::V1::ProblemsController < ApplicationController
  def index
    @problems = Problem.all
    render json: @problems
  end

  def show
    @problem = Problem.find(params[:id])
    render json: @problem
  end
end
