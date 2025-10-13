class UserMailer < ApplicationMailer
  def confirmation_email(user, code:)
    @user = user
    @code = code

    mail(to: user.email, subject: 'Confirme seu email • Clube de Programação UTFPR')
  end

  private

end
