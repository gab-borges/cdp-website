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

User.create!(
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    score: 1815
)

User.create!(
    name: 'Grace Hopper',
    email: 'grace@example.com',
    score: 1906
)

User.create!(
    name: 'Margaret Hamilton',
    email: 'margaret@example.com',
    score: 1936
)

puts "Usuários cadastrados com sucesso!"
