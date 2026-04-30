import { SubscriptionProvider } from './context/SubscriptionContext'
import { SubscriptionForm, type FormData } from './components/SubscriptionForm/SubscriptionForm'
import './App.css'

function App() {
  const handleFormSubmit = (data: FormData) => {
    // TODO: Story 3.3 will implement actual submission logic
  }

  return (
    <SubscriptionProvider>
      <div className="app">
        <h1>Subscription Tracker</h1>
        <SubscriptionForm onSubmit={handleFormSubmit} />
      </div>
    </SubscriptionProvider>
  )
}

export default App

