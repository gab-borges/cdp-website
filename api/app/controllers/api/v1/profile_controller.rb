class Api::V1::ProfileController < ApplicationController
  before_action :authorized

  def show
    render json: serialize_user(current_user)
  end

  def update
    if current_user.update(profile_params)
      render json: serialize_user(current_user)
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def password
    unless current_user.authenticate(password_params[:current_password].to_s)
      return render json: { error: 'Senha atual incorreta' }, status: :unauthorized
    end

    if current_user.update(password_params.slice(:password, :password_confirmation))
      render json: { message: 'Senha atualizada com sucesso' }
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.require(:profile).permit(:name, :bio)
  end

  def password_params
    params.require(:profile).permit(:current_password, :password, :password_confirmation)
  end

  def serialize_user(user)
    user.as_json(except: [:password_digest])
  end
end
