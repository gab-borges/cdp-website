class Api::V1::ProfileController < ApplicationController
  before_action :authorized

  def show
    render json: serialize_user(current_user)
  end

  def update
    permitted = profile_params.to_h.symbolize_keys
    updates = permitted.slice(:name, :bio)

    if profile_params.key?(:codeforces_handle)
      handle = permitted[:codeforces_handle].to_s.strip

      begin
        if handle.present?
          data = CodeforcesClient.fetch_user(handle)
          updates.merge!(
            codeforces_handle: data[:handle],
            codeforces_rating: data[:rating],
            codeforces_rank: data[:rank],
            codeforces_avatar: data[:avatar],
            codeforces_title_photo: data[:title_photo],
            codeforces_last_synced_at: Time.current
          )
        else
          updates.merge!(
            codeforces_handle: nil,
            codeforces_rating: nil,
            codeforces_rank: nil,
            codeforces_avatar: nil,
            codeforces_title_photo: nil,
            codeforces_last_synced_at: nil
          )
        end
      rescue CodeforcesClient::Error => e
        return render json: { error: e.message }, status: :unprocessable_entity
      end
    end

    if updates.empty?
      render json: serialize_user(current_user)
    elsif current_user.update(updates)
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
    params.require(:profile).permit(:name, :bio, :codeforces_handle)
  end

  def password_params
    params.require(:profile).permit(:current_password, :password, :password_confirmation)
  end

  def serialize_user(user)
    user.as_json(except: [:password_digest])
  end
end
