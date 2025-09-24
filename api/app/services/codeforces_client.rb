require 'net/http'
require 'json'

class CodeforcesClient
  USER_INFO_ENDPOINT = URI('https://codeforces.com/api/user.info').freeze
  USER_STATUS_ENDPOINT = URI('https://codeforces.com/api/user.status').freeze
  class Error < StandardError; end

  def self.fetch_user(handle)
    raise Error, 'Handle não informado' if handle.blank?

    uri = USER_INFO_ENDPOINT.dup
    uri.query = URI.encode_www_form(handles: handle.strip)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 5
    http.open_timeout = 5

    response = http.get(uri.request_uri)
    data = JSON.parse(response.body)

    unless response.is_a?(Net::HTTPSuccess) && data['status'] == 'OK'
      message = data['comment'].presence || 'Não foi possível validar o handle no Codeforces.'
      raise Error, message
    end

    user = data['result']&.first
    raise Error, 'Handle não encontrado no Codeforces.' unless user

    {
      handle: user['handle'],
      rating: user['rating'],
      rank: user['rank'],
      avatar: user['avatar'],
      title_photo: user['titlePhoto']
    }
  rescue JSON::ParserError, SocketError, Net::ReadTimeout, Net::OpenTimeout => e
    raise Error, "Falha ao contatar Codeforces: #{e.message}"
  end

  def self.fetch_submissions(handle)
    raise Error, 'Handle não informado' if handle.blank?

    uri = USER_STATUS_ENDPOINT.dup
    uri.query = URI.encode_www_form(handle: handle.strip)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 15 # Increased timeout for potentially larger response
    http.open_timeout = 5

    response = http.get(uri.request_uri)
    data = JSON.parse(response.body)

    unless response.is_a?(Net::HTTPSuccess) && data['status'] == 'OK'
      message = data['comment'].presence || 'Não foi possível buscar as submissões no Codeforces.'
      raise Error, message
    end

    data['result']
  rescue JSON::ParserError, SocketError, Net::ReadTimeout, Net::OpenTimeout => e
    raise Error, "Falha ao contatar Codeforces: #{e.message}"
  end
end
