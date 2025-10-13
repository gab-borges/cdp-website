class Api::V1::UsersController < ApplicationController
    skip_before_action :authorized, only: [:create, :confirm, :resend_confirmation]

    def index
        @users = User.order(Arel.sql('COALESCE(score, 0) + COALESCE(codeforces_score, 0) DESC'))
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
            render json: { message: 'Conta criada! Verifique seu email para confirmar o cadastro.' }, status: :created
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

    def confirm
        identifier = normalized_identifier
        code = params[:code].to_s.strip

        if identifier.blank? || code.blank?
            render json: { error: 'Informe email ou nome de usuário e o código recebido.' }, status: :bad_request
            return
        end

        user = find_user_by_identifier!(identifier)

        if user.confirmed?
            render json: { message: 'Conta já estava confirmada. Você já pode fazer login.' }, status: :ok
            return
        end

        unless user.confirmation_token_valid?
            user.send_confirmation_instructions(force: true)
            render json: { error: 'Código expirado. Enviamos um novo código por email.' }, status: :gone
            return
        end

        unless user.valid_confirmation_code?(code)
            render json: { error: 'Código inválido. Verifique e tente novamente.' }, status: :unauthorized
            return
        end

        user.confirm!
        render json: { message: 'Email confirmado com sucesso! Você já pode fazer login.' }, status: :ok
    rescue ActiveRecord::RecordNotFound
        render json: { message: 'Se sua conta existir, enviaremos instruções para o email informado.' }, status: :ok
    end

    def resend_confirmation
        identifier = normalized_identifier
        if identifier.blank?
            render json: { error: 'Informe email ou nome de usuário.' }, status: :bad_request
            return
        end

        user = find_user_by_identifier!(identifier)

        if user.confirmed?
            render json: { message: 'Conta já confirmada. Você pode fazer login normalmente.' }, status: :ok
            return
        end

        user.send_confirmation_instructions
        render json: { message: 'Enviamos um novo código de confirmação para o seu email.' }, status: :ok
    rescue ActiveRecord::RecordNotFound
        render json: { message: 'Se sua conta existir, enviaremos instruções para o email informado.' }, status: :ok
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

    def normalized_identifier
        params[:email].presence || params[:username].presence
    end

    def find_user_by_identifier!(identifier)
        downcased = identifier.to_s.strip.downcase
        User.find_by!("lower(email) = ? OR lower(username) = ?", downcased, downcased)
    end
end
