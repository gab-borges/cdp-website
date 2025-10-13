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
  { username: 'adalovelace', email: 'ada@example.com', score: 1815, role: :member },
  { username: 'gracehopper', email: 'grace@example.com', score: 1906, role: :member },
  { username: 'mhamilton', email: 'margaret@example.com', score: 1936, role: :member },
  { username: 'gabrielabc', email: 'gabriel.affonso@cdp-website.com', score: 2000, role: :admin },
]

users.each do |attrs|
  email = attrs[:email].downcase
  user = User.find_or_initialize_by(email: email)
  user.username = attrs[:username]
  user.score = attrs[:score]
  user.role = attrs[:role]
  # Always set password for idempotency and to satisfy has_secure_password
  user.password = seed_password
  user.password_confirmation = seed_password
  user.save!
end

puts "Cadastrando posts do feed..."

admin = User.find_by(role: User.roles[:admin])

if admin
  FeedPost.find_or_create_by!(title: 'Bem-vindos ao novo ciclo') do |post|
    post.user = admin
    post.body = <<~MARKDOWN.strip
      Estamos felizes em receber todas as pessoas interessadas em programação competitiva.
      Confira o calendário de treinos e traga suas dúvidas para os mentores!
    MARKDOWN
    post.published_at = Time.current - 2.days
  end

  FeedPost.find_or_create_by!(title: 'Treino de terça-feira') do |post|
    post.user = admin
    post.body = <<~MARKDOWN.strip
      Nesta terça, 18h40, teremos treino sobre estruturas de dados no laboratório CB-106.
      Chegue com antecedência para configurar seu ambiente.
    MARKDOWN
    post.published_at = Time.current - 1.day
  end
end

puts "Usuários cadastrados/atualizados com sucesso!"

puts "Cadastrando problemas..."

problems = [
  {
    title: "Hello World!",
    points: 10,
    difficulty: "Fácil",
    created_at: "2025-09-12 02:42:21.228",
    updated_at: "2025-09-18 02:22:16.494",
    judge: "Kattis",
    judge_identifier: "hello",
    solvers_count: 0,
    description: <<~MD
      **Input**
      There is no input for this problem.

      **Output**    
      Output should contain one line, containing the string "Hello World!".
    MD
  },
  {
    title: "Two-sum",
    points: 10,
    difficulty: "Fácil",
    created_at: "2025-09-18 02:21:25.813",
    updated_at: "2025-09-20 02:38:48.735",
    judge: "Kattis",
    judge_identifier: "twosum",
    solvers_count: 0,
    description: <<~MD
      Per-Magnus is trying to add two integers, but he never learned how to.<br>
      Write a program to help him with this most difficult task!

      **Input**
      The input consists of a single line with two integers $0 \leq a \leq 1000$ and $0 \le b \le 1000$.

      **Output**
      Output a single integer, the sum $a + b$.

      <u>**Test Case 1**</u>
      ```text
      1 1
      ```
      ```text
      2
      ```

      <u>**Test Case 2**</u>
      ```text
      2 2
      ```
      ```text
      4
      ```
    MD
  },
  {
    title: "Finding An A",
    points: 10,
    difficulty: "Fácil",
    created_at: "2025-09-12 03:50:11.375",
    updated_at: "2025-09-19 22:03:37.193",
    judge: "Kattis",
    judge_identifier: "findingana",
    solvers_count: 0,
    description: <<~MD,
      In this problem, you are given a single string $s$ that is guaranteed to contain the letter $a$.<br>  
      You should output the suffix of $s$ that begins with the first occurrence of the letter $a$. Namely, if $s$ consists of characters $s_1 s_2 \dots s_n$ and $i$ is the first index with $s_i = a$, then you should output the string $s_i s_{i+1} \dots s_n$.<br>
      Why do you want to do this? To solve a problem in the contest!

      **Input**
      Input consists of a single line containing a single string $s$ whose length is between $1$ and $1000$. The string is composed of lowercase letters with no spaces. You are guaranteed the letter $a$ appears at least once in $s$.

      **Output**
      Output the suffix of $s$ that begins with the first occurrence of the letter $a$.
    MD
    test_cases: [
      { input: "banana", output: "anana" },
      { input: "polarbear", output: "arbear" },
      { input: "art", output: "art" }
    ]
  }
]

problems.each do |attrs|
  problem = Problem.find_or_initialize_by(title: attrs[:title])
  problem.update!(attrs)
end

puts "Problemas cadastrados/atualizados com sucesso!"
