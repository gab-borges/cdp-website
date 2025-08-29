class Api::V1::SessionsController < ApplicationController
  skip_before_action :authorized, only: [:create]

  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
      secret_key = Rails.application.credentials.secret_key_base
      token = JWT.encode(payload, secret_key)

      render json: { token: token }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end
end
