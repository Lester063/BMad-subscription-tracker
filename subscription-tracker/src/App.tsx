import { SubscriptionProvider } from './context/SubscriptionContext'
import './App.css'

function App() {
  return (
    <SubscriptionProvider>
      <div className="app">
        <h1>Subscription Tracker</h1>
        {/* UI components will be added in Epic 3 */}
      </div>
    </SubscriptionProvider>
  )
}

export default App

