Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :submissions, only: [:index, :create]
      resources :problems, only: [:index, :show, :create, :destroy]
      resources :users, only: [:index, :show, :create, :destroy, :update]
      post "/login", to: "sessions#create"
      get "/me", to: "sessions#me"
      resource :profile, only: [:show, :update], controller: 'profile' do
        patch :password, on: :collection
      end
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
