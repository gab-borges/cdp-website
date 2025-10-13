# api/lib/tasks/import.rake

namespace :problem do
  desc "Gera um comando Rails Console para criar um problema a partir de um arquivo HTML usando uma LLM."
  task :import_from_html, [:file_path] => :environment do |_task, args|
    file_path = args[:file_path]

    unless file_path.present? && File.exist?(file_path)
      puts "ERRO: Forneça um caminho de arquivo válido."
      puts "Uso: bin/rails problem:import_from_html['/caminho/para/seu/problema.html']"
      next
    end

    puts "Lendo o conteúdo de: #{file_path}"
    html_content = File.read(file_path)

    # Simulação de um serviço que interage com a LLM.
    # Você precisaria implementar a lógica real de chamada à API aqui.
    llm_service = LlmProblemParser.new

    puts "Enviando conteúdo para a LLM para análise..."
    begin
      rails_command = llm_service.generate_rails_command(html_content)

      puts "\n✅ Comando gerado com sucesso! Copie e cole no console do Rails (bin/rails c):\n\n"
      puts "------------------------------------------------------------------"
      puts rails_command
      puts "------------------------------------------------------------------"

    rescue StandardError => e
      puts "\n❌ ERRO: Falha ao gerar o comando: #{e.message}"
    end
  end
end

# Você precisaria criar este serviço para se comunicar com a API da LLM.
class LlmProblemParser
  def initialize
    # Aqui você inicializaria o cliente da API da LLM (ex: com a chave de API)
    # Ex: @client = Gemini::Client.new(api_key: ENV['GEMINI_API_KEY'])
  end

  def generate_rails_command(html_content)
    prompt = <<~PROMPT
    Você é um assistente especialista em Ruby on Rails e programação competitiva.
    Sua tarefa é extrair informações de um arquivo HTML de um problema e gerar um comando de Rails Console para criar um registro no banco de dados.

    O modelo é `Problem` e possui os seguintes atributos:
    - `title`: string (obrigatório)
    - `description`: text (deve ser formatado em Markdown)
    - `points`: integer
    - `difficulty`: string (Ex: "Fácil", "Médio", "Difícil")
    - `judge`: string (Ex: "Kattis", "Codeforces")
    - `judge_identifier`: string (O ID do problema na plataforma de origem)

    Analise o conteúdo HTML abaixo, extraia os dados e formate-os em uma única linha de código `Problem.create!()`.
    A descrição do problema deve ser convertida para Markdown, prestando atenção em exemplos de entrada/saída, que devem ser formatados como blocos de código.

    HTML do problema:
    ```html
    #{html_content}
    ```

    Retorne apenas a linha de código Ruby.
    PROMPT

    # --- Lógica de Chamada à API da LLM (Exemplo Simulado) ---
    # response = @client.generate_content(prompt)
    # return response.text.strip

    # Para fins de exemplo, vamos retornar um comando mockado:
    # Em um cenário real, a linha abaixo seria substituída pela chamada à API.
    mock_response = "Problem.create!(title: \"Two-Sum\", description: \"Dado um array de inteiros, retorne os índices dos dois números que somam um alvo específico.\\n\\n**Exemplo:**\\n```\\nInput: nums = [2,7,11,15], target = 9\\nOutput: [0,1]\\n```\", points: 20, difficulty: \"Fácil\", judge: \"LeetCode\", judge_identifier: \"1\")"
    
    return mock_response
  end
end
