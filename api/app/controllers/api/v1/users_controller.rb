class Api::V1::UsersController < ApplicationController
    skip_before_action :authorized, only: [:create]

    def index
        @users = User.all
        render json: @users
    end

    def show
        @user = User.find(params[:id])
        render json: @user
    end
    
    def destroy
        @user = User.find(params[:id])
        @user.destroy
        head :no_content
    end
    
    def create
        @user = User.new(user_params)
        if @user.save
            render json: @user, status: :created
        else
            if @user.errors.added?(:email, :taken)
                render json: { error: 'Email already registered' }, status: :conflict
            else
                render json: @user.errors, status: :unprocessable_entity
            end
        end
    rescue ActiveRecord::RecordNotUnique
        # Race condition fallback for unique index
        render json: { error: 'Email already registered' }, status: :conflict
    end

    def update
        @user = User.find(params[:id])
        
        if @user.update(user_params)
            render json: @user
        else
            render json: @user.errors, status: :unprocessable_entity
        end
    end

    private

    # Filtra os parâmetros por segurança
    def user_params
        params.require(:user).permit(:name, :email, :score, :password, :password_confirmation)
    end
end
