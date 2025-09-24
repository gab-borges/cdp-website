class ApplicationController < ActionController::API
  include ActiveStorage::SetCurrent
  before_action :authorized

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  def auth_header
    request.headers['Authorization']
  end

  def decoded_token
    if auth_header
      token = auth_header.split(' ')[1]
      begin
        JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256')
      rescue JWT::DecodeError
        nil
      end
    end
  end

  def current_user
    if decoded_token
      user_id = decoded_token[0]['user_id']
      @current_user ||= User.find_by(id: user_id)
    end
  end

  def logged_in?
    !!current_user
  end

  def authorized
    render json: { message: 'Please log in' }, status: :unauthorized unless logged_in?
  end

  def require_admin!
    return if current_user&.role_admin?

    render json: { error: 'Forbidden' }, status: :forbidden
  end

  def render_not_found(_error)
    render json: { error: 'Not found' }, status: :not_found
  end

  def user_profile_payload(user, include_email: false, include_stats: false)
    payload = {
      id: user.id,
      username: user.username,
      score: user.score,
      codeforces_score: user.codeforces_score,
      bio: user.bio,
      codeforces_handle: user.codeforces_handle,
      codeforces_rating: user.codeforces_rating,
      codeforces_rank: user.codeforces_rank,
      codeforces_avatar: user.codeforces_avatar,
      codeforces_title_photo: user.codeforces_title_photo,
      codeforces_last_synced_at: user.codeforces_last_synced_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      name: user.username,
      total_score: user.total_score,
      monthly_score: user.monthly_score
    }
    payload[:email] = user.email if include_email
    payload[:solved_problems_count] = user.solved_problems_count if include_stats
    payload
  end

  def user_summary_payload(user)
    {
      id: user.id,
      username: user.username,
      score: user.score,
      codeforces_score: user.codeforces_score,
      name: user.username,
      total_score: user.total_score,
      monthly_score: user.monthly_score,
      codeforces_title_photo: user.codeforces_title_photo
    }
  end
end
