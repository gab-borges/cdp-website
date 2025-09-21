# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
puts "Cadastrando usuários..."

seed_password = ENV.fetch('SEED_USER_PASSWORD', 'changeme123')

users = [
  { username: 'adalovelace', email: 'ada@example.com', score: 1815 },
  { username: 'gracehopper', email: 'grace@example.com', score: 1906 },
  { username: 'mhamilton', email: 'margaret@example.com', score: 1936 },
  { username: 'gabrielabc', email: 'gabriel.affonso@cdp-website.com', score: 2000 },
]

users.each do |attrs|
  email = attrs[:email].downcase
  user = User.find_or_initialize_by(email: email)
  user.username = attrs[:username]
  user.score = attrs[:score]
  # Always set password for idempotency and to satisfy has_secure_password
  user.password = seed_password
  user.password_confirmation = seed_password
  user.save!
end

puts "Usuários cadastrados/atualizados com sucesso!"
