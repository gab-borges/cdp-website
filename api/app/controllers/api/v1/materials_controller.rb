# frozen_string_literal: true

class Api::V1::MaterialsController < ApplicationController
  before_action :set_material, only: [:update, :destroy]
  before_action :require_admin!, only: [:create, :update, :destroy]

  def index
    materials = Material.includes(file_attachment: :blob, thumbnail_attachment: :blob).recent_first
    render json: { materials: materials.map { |material| material_payload(material) } }
  end

  def create
    material = current_user.materials.build(material_params)
    assign_attachments(material)

    if material.save
      render json: material_payload(material), status: :created
    else
      render json: { errors: material.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    assign_attachments(@material)

    if @material.update(material_params)
      render json: material_payload(@material)
    else
      render json: { errors: @material.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @material.destroy
    head :no_content
  end

  private

  def set_material
    @material = Material.find(params[:id])
  end

  def material_params
    params.require(:material).permit(:title, :description)
  end

  def assign_attachments(material)
    file_param = params.dig(:material, :file)
    thumbnail_param = params.dig(:material, :thumbnail)

    material.file.attach(file_param) if file_param.present?
    material.thumbnail.attach(thumbnail_param) if thumbnail_param.present?
  end

  def material_payload(material)
    base_url = request.base_url
    file_blob = material.file&.blob
    thumbnail_blob = material.thumbnail&.blob

    download_path = file_blob ? Rails.application.routes.url_helpers.rails_blob_path(file_blob, only_path: true) : nil
    thumbnail_path = thumbnail_blob ? Rails.application.routes.url_helpers.rails_blob_path(thumbnail_blob, only_path: true) : nil

    {
      id: material.id,
      title: material.title,
      description: material.description,
      created_at: material.created_at.iso8601,
      download_url: download_path ? "#{base_url}#{download_path}" : nil,
      thumbnail_url: thumbnail_path ? "#{base_url}#{thumbnail_path}" : nil,
      file_size: file_blob&.byte_size,
      content_type: file_blob&.content_type,
      filename: file_blob&.filename&.to_s
    }
  end
end
