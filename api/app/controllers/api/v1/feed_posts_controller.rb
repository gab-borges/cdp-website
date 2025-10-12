# frozen_string_literal: true

class Api::V1::FeedPostsController < ApplicationController
  before_action :require_admin!, only: [:create, :update, :destroy]
  before_action :set_feed_post, only: [:update, :destroy]

  def index
    page = params.fetch(:page, 1).to_i
    per_page = params.fetch(:per_page, 10).to_i

    page = 1 if page <= 0
    per_page = 10 if per_page <= 0
    per_page = 50 if per_page > 50

    scope = FeedPost.includes(:user).recent_first
    total_count = scope.count
    total_pages = (total_count.to_f / per_page).ceil
    total_pages = 1 if total_pages.zero?
    page = total_pages if page > total_pages

    next_page = page < total_pages ? page + 1 : nil

    posts = scope.offset((page - 1) * per_page).limit(per_page)

    render json: {
      posts: posts.map { |post| feed_post_payload(post) },
      meta: {
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        total_count: total_count,
        next_page: next_page
      }
    }
  end

  def create
    post = current_user.feed_posts.build(feed_post_params)
    post.published_at ||= Time.current

    if post.save
      render json: feed_post_payload(post), status: :created
    else
      render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    attributes = feed_post_params.to_h
    attributes.delete_if { |key, value| key.to_s == 'published_at' && value.blank? }

    if @feed_post.update(attributes)
      render json: feed_post_payload(@feed_post)
    else
      render json: { errors: @feed_post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @feed_post.destroy
    head :no_content
  end

  private

  def feed_post_params
    params.require(:feed_post).permit(:title, :body, :published_at)
  end

  def feed_post_payload(post)
    {
      id: post.id,
      title: post.title,
      body: post.body,
      published_at: post.published_at.iso8601,
      author: {
        id: post.user_id,
        username: post.user.username,
        role: post.user.role,
        codeforces_title_photo: post.user.codeforces_title_photo,
        avatar_url: post.user.codeforces_title_photo
      }
    }
  end

  def set_feed_post
    @feed_post = FeedPost.find(params[:id])
  end
end
