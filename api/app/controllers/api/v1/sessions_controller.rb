class Api::V1::SessionsController < ApplicationController
  skip_before_action :authorized, only: [:create]

  def create
    login_value = params[:email].presence || params[:username].presence
    user = if login_value
             User.find_by(email: login_value) || User.find_by(username: login_value)
           end

    if user&.authenticate(params[:password])
      payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
      secret_key = Rails.application.credentials.secret_key_base
      token = JWT.encode(payload, secret_key)

      render json: { token: token }, status: :ok
    else
      render json: { error: 'Invalid email/username or password' }, status: :unauthorized
    end
  end

  def me
    # Returns the current user from JWT, excluding sensitive fields
    if current_user
      render json: user_profile_payload(current_user, include_email: true, include_stats: true), status: :ok
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end
end
