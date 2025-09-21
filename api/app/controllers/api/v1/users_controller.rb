class Api::V1::UsersController < ApplicationController
    skip_before_action :authorized, only: [:create]

    def index
        @users = User.select(:id, :username, :score).order(score: :desc)
        render json: @users.map { |user| user_summary_payload(user) }
    end

    def show
        @user = User.find_by!(username: params[:username])
        render json: user_profile_payload(@user, include_email: true, include_stats: true)
    end
    
    def destroy
        @user = User.find_by!(username: params[:username])
        @user.destroy
        head :no_content
    end
    
    def create
        @user = User.new(user_params)
        if @user.save
            render json: user_profile_payload(@user, include_email: true, include_stats: true), status: :created
        else
            if @user.errors.added?(:email, :taken) || @user.errors.added?(:username, :taken)
                conflict_fields = []
                conflict_fields << 'Email' if @user.errors.added?(:email, :taken)
                conflict_fields << 'Username' if @user.errors.added?(:username, :taken)

                message =
                  case conflict_fields.length
                  when 0
                    'Unable to register account'
                  when 1
                    "#{conflict_fields.first} already registered"
                  else
                    'Email or username already registered'
                  end

                render json: { error: message }, status: :conflict
            else
                render json: @user.errors, status: :unprocessable_entity
            end
        end
    rescue ActiveRecord::RecordNotUnique
        # Race condition fallback for unique index
        render json: { error: 'Email or username already registered' }, status: :conflict
    end

    def update
        @user = User.find_by!(username: params[:username])
        
        if @user.update(user_params)
            render json: user_profile_payload(@user, include_email: true, include_stats: true)
        else
            render json: @user.errors, status: :unprocessable_entity
        end
    end

    private

    # Filtra os parâmetros por segurança
    def user_params
        params.require(:user).permit(:username, :email, :score, :password, :password_confirmation)
    end
end
