import { useDeferredValue, useEffect, useState } from 'react'
import './App.css'

type RouteKey = 'dashboard' | 'visitors' | 'deliveries' | 'codes'
type VisitorStatus = 'checked-in' | 'expected' | 'waiting'
type DeliveryStatus = 'active' | 'pending' | 'expired'
type CodeStatus = 'active' | 'pending' | 'expired'

type Visitor = {
  id: string
  name: string
  unit: string
  details: string
  code: string
  time: string
  status: VisitorStatus
}

type Delivery = {
  id: string
  relationId?: string
  vendor: string
  category: string
  code: string
  expiresAt: string
  status: DeliveryStatus
}

type AccessCode = {
  id: string
  relationId?: string
  code: string
  person: string
  purpose: string
  validUntil: string
  status: CodeStatus
}

const tabs: { key: RouteKey; label: string; shortLabel: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: 'grid' },
  { key: 'visitors', label: 'Visitors', shortLabel: 'Visitors', icon: 'users' },
  { key: 'deliveries', label: 'Deliveries', shortLabel: 'Deliveries', icon: 'truck' },
  { key: 'codes', label: 'Codes', shortLabel: 'Codes', icon: 'qr' },
]

const initialVisitors: Visitor[] = []

const initialDeliveries: Delivery[] = []

const initialCodes: AccessCode[] = []

function getRouteFromHash(hash: string): RouteKey {
  const normalized = hash.replace('#', '')
  if (tabs.some((tab) => tab.key === normalized)) {
    return normalized as RouteKey
  }
  return 'dashboard'
}

function buildCode(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

function getPasswordStrength(password: string) {
  const lengthScore = password.length >= 8 ? 1 : 0
  const caseScore = /[a-z]/.test(password) && /[A-Z]/.test(password) ? 1 : 0
  const numberScore = /\d/.test(password) ? 1 : 0
  const symbolScore = /[^A-Za-z0-9]/.test(password) ? 1 : 0
  const score = lengthScore + caseScore + numberScore + symbolScore

  if (score <= 1) {
    return { label: 'Weak password', level: 1 as const }
  }

  if (score <= 3) {
    return { label: 'Medium password', level: 2 as const }
  }

  return { label: 'Strong password', level: 4 as const }
}

function Icon({ name, active = false }: { name: string; active?: boolean }) {
  switch (name) {
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4c2 1.7 4.4 2.7 7 3v4.8c0 4.2-2.8 7.9-7 9.2-4.2-1.3-7-5-7-9.2V7c2.6-.3 5-1.3 7-3Z" />
        </svg>
      )
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M3.5 18.5a4.5 4.5 0 0 1 9 0" />
          <path d="M13.5 18.5a3.8 3.8 0 0 1 7 0" />
        </svg>
      )
    case 'truck':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 7h10v8H3z" />
          <path d="M13 10h4l3 3v2h-7z" />
          <circle cx="8" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      )
    case 'qr':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
          <path d="M14 14h2v2h-2zM18 14h2v2h-2zM16 16h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4a4 4 0 0 0-4 4v2.4c0 .9-.3 1.8-.8 2.5L6 15h12l-1.2-2.1a4.7 4.7 0 0 1-.8-2.5V8a4 4 0 0 0-4-4Z" />
          <path d="M10 18a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </svg>
      )
    case 'chevron':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m10 7 5 5-5 5" />
        </svg>
      )
    case 'chevron-down':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      )
    case 'copy':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="9" width="10" height="10" rx="2" />
          <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
      )
    case 'share':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="2" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="19" r="2" />
          <path d="m8 12 8-5M8 12l8 5" />
        </svg>
      )
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="m5 8 7 5 7-5" />
        </svg>
      )
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      )
    case 'eye':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )
    case 'eye-off':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 3 21 21" />
          <path d="M10.6 10.7a2.5 2.5 0 0 0 3 3" />
          <path d="M9.4 5.8A10.7 10.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-4 4.6" />
          <path d="M6.2 6.2A17.8 17.8 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.9-.4 4.1-1" />
        </svg>
      )
    case 'apple':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.5 6.2c.9-1 .8-2.2.8-2.7-1 .1-2.2.7-2.9 1.6-.7.8-.9 1.9-.8 2.7 1.1.1 2.1-.5 2.9-1.6Z" />
          <path d="M16.8 12.5c0-2 1.6-3 1.7-3.1-1-1.5-2.7-1.7-3.2-1.7-1.4-.2-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.6 0-3 .9-3.8 2.2-1.6 2.8-.4 6.9 1.1 9 .7 1 1.6 2.1 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.5-1-2.5-3.9Z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M8 4v4M16 4v4M4 10h16" />
        </svg>
      )
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 1.5" />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.2 6.2l2.8 2.8M15 15l2.8 2.8M17.8 6.2 15 9M9 15l-2.8 2.8" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" className={active ? 'filled' : ''} />
        </svg>
      )
  }
}

function App() {
  const [route, setRoute] = useState<RouteKey>(() => getRouteFromHash(window.location.hash))
  const [showIntro, setShowIntro] = useState(true)
  const [introPhase, setIntroPhase] = useState<'enter' | 'exit'>('enter')
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [visitors, setVisitors] = useState(initialVisitors)
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [codes, setCodes] = useState(initialCodes)
  const [visitorFilter, setVisitorFilter] = useState<'active' | 'expected' | 'history'>('active')
  const [codeFilter, setCodeFilter] = useState<'active' | 'expired'>('active')
  const [visitorSearch, setVisitorSearch] = useState('')
  const [codeSearch, setCodeSearch] = useState('')
  const [service, setService] = useState('')
  const [deliveryType, setDeliveryType] = useState('Food')
  const [deliveryDate, setDeliveryDate] = useState('Mar 18')
  const [deliveryTime, setDeliveryTime] = useState('5:00 PM')
  const deferredVisitorSearch = useDeferredValue(visitorSearch)
  const deferredCodeSearch = useDeferredValue(codeSearch)

  useEffect(() => {
    const syncRoute = () => setRoute(getRouteFromHash(window.location.hash))
    window.addEventListener('hashchange', syncRoute)

    if (!window.location.hash) {
      window.location.hash = '#dashboard'
    }

    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    window.location.hash = '#dashboard'
    setRoute('dashboard')

    const exitTimer = window.setTimeout(() => {
      setIntroPhase('exit')
    }, 1350)

    const finishTimer = window.setTimeout(() => {
      setShowIntro(false)
    }, 2050)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(finishTimer)
    }
  }, [])

  const navigate = (nextRoute: RouteKey) => {
    window.location.hash = nextRoute
  }

  const completeOnboarding = () => {
    setOnboardingComplete(true)
    navigate('dashboard')
  }

  const checkedInCount = visitors.filter((visitor) => visitor.status === 'checked-in').length
  const deliveryActiveCount = deliveries.filter((delivery) => delivery.status === 'active').length
  const expectedCount = visitors.filter((visitor) => visitor.status === 'expected').length
  const expiredCount = codes.filter((code) => code.status === 'expired').length

  const recentActivity = [
    ...visitors.slice(0, 2).map((visitor) => ({
      id: `visitor-${visitor.id}`,
      title: visitor.name,
      badge: visitor.status === 'checked-in' ? 'Visitor' : 'Expected',
      badgeTone: (visitor.status === 'checked-in' ? 'blue' : 'green') as 'blue' | 'green',
      meta: `Code: ${visitor.code} · ${visitor.time}`,
    })),
    ...deliveries.slice(0, 1).map((delivery) => ({
      id: `delivery-${delivery.id}`,
      title: delivery.vendor,
      badge: statusLabel(delivery.status),
      badgeTone: (
        delivery.status === 'expired' ? 'red' : delivery.status === 'active' ? 'blue' : 'green'
      ) as 'blue' | 'green' | 'red',
      meta: `${delivery.code} · ${delivery.expiresAt}`,
    })),
  ] as const

  const filteredVisitors = visitors.filter((visitor) => {
    const matchesQuery =
      `${visitor.name} ${visitor.unit} ${visitor.details} ${visitor.code}`
        .toLowerCase()
        .includes(deferredVisitorSearch.toLowerCase())

    if (!matchesQuery) {
      return false
    }

    if (visitorFilter === 'history') {
      return visitor.status === 'checked-in'
    }

    if (visitorFilter === 'expected') {
      return visitor.status === 'expected'
    }

    return visitor.status !== 'checked-in'
  })

  const filteredCodes = codes.filter((code) => {
    const matchesQuery =
      `${code.code} ${code.person} ${code.purpose}`.toLowerCase().includes(deferredCodeSearch.toLowerCase())

    if (!matchesQuery) {
      return false
    }

    if (codeFilter === 'expired') {
      return code.status !== 'active'
    }

    return code.status === 'active' || code.status === 'pending'
  })

  const createDeliveryCode = () => {
    const vendor = service.trim() || 'Custom Delivery'
    const newCode = buildCode('DLV')
    const relationId = crypto.randomUUID()

    setDeliveries((current) => [
      {
        id: crypto.randomUUID(),
        relationId,
        vendor,
        category: `${deliveryType} Delivery`,
        code: newCode,
        expiresAt: `Expires ${deliveryTime}`,
        status: 'active',
      },
      ...current,
    ])

    setCodes((current) => [
      {
        id: crypto.randomUUID(),
        relationId,
        code: buildCode('GP'),
        person: vendor,
        purpose: 'Delivery',
        validUntil: `Valid until ${deliveryDate}, ${deliveryTime}`,
        status: 'active',
      },
      ...current,
    ])

    setService('')
    setDeliveryTime('5:00 PM')
    navigate('deliveries')
  }

  const addQuickVisitor = () => {
    const nextNumber = visitors.length + 1
    setVisitors((current) => [
      {
        id: crypto.randomUUID(),
        name: `Guest ${nextNumber}`,
        unit: `Unit ${10 + nextNumber}A`,
        details: 'Walk-in',
        code: buildCode('GP'),
        time: 'Expected in 30 min',
        status: 'expected',
      },
      ...current,
    ])
  }

  const addQuickCode = () => {
    setCodes((current) => [
      {
        id: crypto.randomUUID(),
        code: buildCode('GP'),
        person: 'New resident guest',
        purpose: 'Visitor',
        validUntil: 'Valid until Mar 18, 8:00 PM',
        status: 'active',
      },
      ...current,
    ])
  }

  const copyCode = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      window.prompt('Copy code', value)
    }
  }

  const revokeCode = (codeId: string) => {
    const targetCode = codes.find((entry) => entry.id === codeId)

    if (!targetCode || targetCode.status === 'expired') {
      return
    }

    setCodes((current) =>
      current.map((entry) =>
        entry.id === codeId
          ? {
              ...entry,
              status: 'expired',
              validUntil: 'Access revoked',
            }
          : targetCode.relationId && entry.relationId === targetCode.relationId
            ? {
                ...entry,
                status: 'expired',
                validUntil: 'Access revoked',
              }
            : entry,
      ),
    )

    if (targetCode.relationId) {
      setDeliveries((current) =>
        current.map((delivery) =>
          delivery.relationId === targetCode.relationId
            ? {
                ...delivery,
                status: 'expired',
                expiresAt: 'Access revoked',
              }
            : delivery,
        ),
      )
    }
  }

  return (
    <div className="app-shell">
      <div className="device-frame">
        <StatusBar />
        <div className="screen-content">
          {!onboardingComplete ? (
            <OnboardingPage
              firstName={firstName}
              onFirstNameChange={setFirstName}
              surname={surname}
              onSurnameChange={setSurname}
              email={email}
              onEmailChange={setEmail}
              password={password}
              onPasswordChange={setPassword}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((current) => !current)}
              passwordFocused={passwordFocused}
              onPasswordFocus={() => setPasswordFocused(true)}
              onPasswordBlur={() => setPasswordFocused(false)}
              onContinue={completeOnboarding}
            />
          ) : null}

          {onboardingComplete && route === 'dashboard' ? (
            <DashboardPage
              displayName={firstName.trim() || 'Alex'}
              checkedInCount={checkedInCount}
              deliveryActiveCount={deliveryActiveCount}
              expectedCount={expectedCount}
              expiredCount={expiredCount}
              recentActivity={recentActivity}
              onSeeAll={() => navigate('visitors')}
            />
          ) : null}

          {onboardingComplete && route === 'visitors' ? (
            <VisitorsPage
              filter={visitorFilter}
              onFilterChange={setVisitorFilter}
              search={visitorSearch}
              onSearchChange={setVisitorSearch}
              onAdd={addQuickVisitor}
              visitors={filteredVisitors}
            />
          ) : null}

          {onboardingComplete && route === 'deliveries' ? (
            <DeliveriesPage
              deliveries={deliveries}
              service={service}
              onServiceChange={setService}
              deliveryType={deliveryType}
              onDeliveryTypeChange={setDeliveryType}
              deliveryDate={deliveryDate}
              onDeliveryDateChange={setDeliveryDate}
              deliveryTime={deliveryTime}
              onDeliveryTimeChange={setDeliveryTime}
              onGenerate={createDeliveryCode}
            />
          ) : null}

          {onboardingComplete && route === 'codes' ? (
            <CodesPage
              filter={codeFilter}
              onFilterChange={setCodeFilter}
              search={codeSearch}
              onSearchChange={setCodeSearch}
              onAdd={addQuickCode}
              codes={filteredCodes}
              onCopy={copyCode}
              onRevoke={revokeCode}
            />
          ) : null}
        </div>
        {!showIntro && onboardingComplete ? <TabBar activeRoute={route} onNavigate={navigate} /> : null}
        {showIntro ? <IntroScreen phase={introPhase} /> : null}
      </div>
    </div>
  )
}

function IntroScreen({ phase }: { phase: 'enter' | 'exit' }) {
  return (
    <div className={`intro-screen intro-screen--${phase}`}>
      <div className="intro-mark">
        <span className="intro-logo">
          <Icon name="shield" />
        </span>
        <strong>GatePass</strong>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <header className="status-bar">
      <span className="status-time">9:41</span>
      <div className="status-icons" aria-hidden="true">
        <span className="status-dot" />
        <span className="status-dot" />
        <span className="status-battery" />
      </div>
    </header>
  )
}

function Header({
  title,
  subtitle,
  actionIcon,
  onAction,
}: {
  title: string
  subtitle: string
  actionIcon: 'bell' | 'plus'
  onAction?: () => void
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button className="icon-button" type="button" onClick={onAction}>
        <Icon name={actionIcon} />
      </button>
    </div>
  )
}

function OnboardingPage({
  firstName,
  onFirstNameChange,
  surname,
  onSurnameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  passwordFocused,
  onPasswordFocus,
  onPasswordBlur,
  onContinue,
}: {
  firstName: string
  onFirstNameChange: (value: string) => void
  surname: string
  onSurnameChange: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
  password: string
  onPasswordChange: (value: string) => void
  showPassword: boolean
  onTogglePassword: () => void
  passwordFocused: boolean
  onPasswordFocus: () => void
  onPasswordBlur: () => void
  onContinue: () => void
}) {
  const passwordStrength = getPasswordStrength(password)

  return (
    <section className="page onboarding-page">
      <div className="onboarding-copy">
        <h1>Create your account</h1>
        <p>Set up your profile to continue</p>
      </div>

      <div className="onboarding-form">
        <label className="field-column">
          <span className="field-label">Name</span>
          <input
            className="text-input"
            value={firstName}
            onChange={(event) => onFirstNameChange(event.target.value)}
            placeholder="John"
          />
        </label>

        <label className="field-column">
          <span className="field-label">Surname</span>
          <input
            className="text-input"
            value={surname}
            onChange={(event) => onSurnameChange(event.target.value)}
            placeholder="Doe"
          />
        </label>

        <label className="field-column">
          <span className="field-label">Email</span>
          <span className="leading-input">
            <span className="leading-input__icon">
              <Icon name="mail" />
            </span>
            <input
              className="text-input leading-input__field"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="john.doe@email.com"
            />
          </span>
        </label>

        <label className="field-column">
          <span className="field-label">Password</span>
          <span className="leading-input trailing-input">
            <span className="leading-input__icon">
              <Icon name="lock" />
            </span>
            <input
              className="text-input leading-input__field trailing-input__field"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              onFocus={onPasswordFocus}
              onBlur={onPasswordBlur}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="trailing-input__button"
              onClick={onTogglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} />
            </button>
          </span>
          {passwordFocused ? (
            <div className="password-strength" aria-live="polite">
              <div className="password-strength__bars">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={
                      index < passwordStrength.level
                        ? 'password-strength__bar password-strength__bar-active'
                        : 'password-strength__bar'
                    }
                  />
                ))}
              </div>
              <span className="password-strength__label">{passwordStrength.label}</span>
            </div>
          ) : null}
        </label>
      </div>

      <div className="onboarding-actions">
        <button type="button" className="primary-button onboarding-continue" onClick={onContinue}>
          Continue
        </button>

        <div className="onboarding-divider">
          <span />
          <em>or</em>
          <span />
        </div>

        <button type="button" className="social-button">
          <span className="social-button__mark social-button__mark--google">G</span>
          Continue with Google
        </button>

        <button type="button" className="social-button">
          <span className="social-button__icon">
            <Icon name="apple" />
          </span>
          Continue with Apple
        </button>
      </div>

      <p className="onboarding-legal">By continuing you agree to the Terms and Privacy Policy.</p>
    </section>
  )
}

function DashboardPage({
  displayName,
  checkedInCount,
  deliveryActiveCount,
  expectedCount,
  expiredCount,
  recentActivity,
  onSeeAll,
}: {
  displayName: string
  checkedInCount: number
  deliveryActiveCount: number
  expectedCount: number
  expiredCount: number
  recentActivity: readonly {
    id: string
    title: string
    badge: string
    badgeTone: 'blue' | 'green' | 'red'
    meta: string
  }[]
  onSeeAll: () => void
}) {
  const metrics = [
    {
      value: checkedInCount,
      label: 'Active Visitor\nCodes',
      note: `${checkedInCount} vs yesterday`,
      tone: 'blue',
    },
    {
      value: deliveryActiveCount,
      label: 'Active Delivery\nCodes',
      note: `${deliveryActiveCount} arriving soon`,
      tone: 'blue',
    },
    {
      value: expectedCount,
      label: 'Expected Today',
      note: 'On schedule',
      tone: 'green',
    },
    {
      value: expiredCount,
      label: 'Expired Today',
      note: 'Needs attention',
      tone: 'red',
    },
  ] as const

  return (
    <section className="page page-dashboard">
      <Header title={displayName} subtitle={`${expectedCount} arrivals pending today`} actionIcon="bell" />
      <div className="greeting-copy">Good morning</div>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className={`metric-card metric-${metric.tone}`}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
            <em>{metric.note}</em>
          </article>
        ))}
      </div>
      <div className="section-header">
        <span>Recent Activity</span>
        <button type="button" className="text-link" onClick={onSeeAll}>
          See All
        </button>
      </div>
      {recentActivity.length ? (
        <div className="stack-list">
          {recentActivity.map((activity) => (
            <article key={activity.id} className="list-card">
              <div className="list-card__copy">
                <div className="list-card__top">
                  <h2>{activity.title}</h2>
                  <span className={`pill pill-${activity.badgeTone}`}>{activity.badge}</span>
                </div>
                <p>{activity.meta}</p>
              </div>
              <span className="chevron">
                <Icon name="chevron" />
              </span>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activity yet"
          description="Your first visitor, delivery, or code will appear here."
        />
      )}
    </section>
  )
}

function VisitorsPage({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onAdd,
  visitors,
}: {
  filter: 'active' | 'expected' | 'history'
  onFilterChange: (value: 'active' | 'expected' | 'history') => void
  search: string
  onSearchChange: (value: string) => void
  onAdd: () => void
  visitors: Visitor[]
}) {
  const segments = [
    { key: 'active', label: 'Active' },
    { key: 'expected', label: 'Expected' },
    { key: 'history', label: 'History' },
  ] as const

  return (
    <section className="page">
      <Header title="Visitors" subtitle="Today's check-ins and expected arrivals" actionIcon="plus" onAction={onAdd} />
      <SegmentedControl
        items={segments}
        activeKey={filter}
        onChange={(value) => onFilterChange(value as 'active' | 'expected' | 'history')}
      />
      <SearchField
        value={search}
        onChange={onSearchChange}
        placeholder="Search visitor, unit, code..."
      />
      {visitors.length ? (
        <div className="stack-list">
          {visitors.map((visitor) => (
            <article key={visitor.id} className="list-card visitor-card">
              <div className="list-card__copy">
                <div className="list-card__top">
                  <h2>{visitor.name}</h2>
                  <span className={`pill ${statusClass(visitor.status)}`}>{statusLabel(visitor.status)}</span>
                </div>
                <p>
                  {visitor.unit} • {visitor.details}
                </p>
                <p className="meta-row">
                  <span>Code {visitor.code}</span>
                  <span>{visitor.time}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No visitors yet"
          description="Tap the plus button to add your first guest or expected arrival."
        />
      )}
    </section>
  )
}

function DeliveriesPage({
  deliveries,
  service,
  onServiceChange,
  deliveryType,
  onDeliveryTypeChange,
  deliveryDate,
  onDeliveryDateChange,
  deliveryTime,
  onDeliveryTimeChange,
  onGenerate,
}: {
  deliveries: Delivery[]
  service: string
  onServiceChange: (value: string) => void
  deliveryType: string
  onDeliveryTypeChange: (value: string) => void
  deliveryDate: string
  onDeliveryDateChange: (value: string) => void
  deliveryTime: string
  onDeliveryTimeChange: (value: string) => void
  onGenerate: () => void
}) {
  return (
    <section className="page page-deliveries">
      <Header title="Deliveries" subtitle="Generate and track temporary access" actionIcon="plus" />
      <div className="form-block">
        <label className="field-label" htmlFor="service">
          Delivery Service
        </label>
        <input
          id="service"
          className="text-input"
          value={service}
          onChange={(event) => onServiceChange(event.target.value)}
          placeholder="e.g. UberEats, DHL"
        />
        <div className="form-row">
          <div className="field-column">
            <label className="field-label" htmlFor="delivery-type">
              Type
            </label>
            <div className="select-wrap">
              <select
                id="delivery-type"
                className="select-input"
                value={deliveryType}
                onChange={(event) => onDeliveryTypeChange(event.target.value)}
              >
                <option>Food</option>
                <option>Parcel</option>
                <option>Courier</option>
              </select>
              <span className="input-icon">
                <Icon name="chevron-down" />
              </span>
            </div>
          </div>
          <div className="field-column">
            <label className="field-label" htmlFor="delivery-date">
              Date
            </label>
            <div className="date-input">
              <input
                id="delivery-date"
                className="text-input text-input--compact"
                value={deliveryDate}
                onChange={(event) => onDeliveryDateChange(event.target.value)}
              />
              <span className="input-icon">
                <Icon name="calendar" />
              </span>
            </div>
          </div>
        </div>
        <div className="field-column">
          <label className="field-label" htmlFor="delivery-time">
            Expires at
          </label>
          <div className="date-input">
            <input
              id="delivery-time"
              className="text-input text-input--compact"
              value={deliveryTime}
              onChange={(event) => onDeliveryTimeChange(event.target.value)}
            />
            <span className="input-icon">
              <Icon name="clock" />
            </span>
          </div>
        </div>
        <button type="button" className="primary-button" onClick={onGenerate}>
          <Icon name="spark" />
          Generate Code
        </button>
      </div>

      <div className="section-header section-header--spaced">
        <span>Recent Delivery Codes</span>
      </div>
      {deliveries.length ? (
        <div className="stack-list">
          {deliveries.map((delivery) => (
            <article key={delivery.id} className="list-card delivery-card">
              <div className="vendor-mark vendor-mark--accent">{delivery.vendor.slice(0, 2)}</div>
              <div className="list-card__copy">
                <div className="list-card__top">
                  <h2>{delivery.vendor}</h2>
                  <span className={`pill ${statusClass(delivery.status)}`}>{statusLabel(delivery.status)}</span>
                </div>
                <p>{delivery.category}</p>
                <p className="meta-row">
                  <span className="code-link">{delivery.code}</span>
                  <span>{delivery.expiresAt}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No delivery codes yet"
          description="Generate your first code above to start tracking deliveries."
        />
      )}
    </section>
  )
}

function CodesPage({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onAdd,
  codes,
  onCopy,
  onRevoke,
}: {
  filter: 'active' | 'expired'
  onFilterChange: (value: 'active' | 'expired') => void
  search: string
  onSearchChange: (value: string) => void
  onAdd: () => void
  codes: AccessCode[]
  onCopy: (value: string) => void
  onRevoke: (codeId: string) => void
}) {
  const segments = [
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
  ] as const

  return (
    <section className="page">
      <Header title="Active codes" subtitle="Manage and share access codes" actionIcon="plus" onAction={onAdd} />
      <SegmentedControl
        items={segments}
        activeKey={filter}
        onChange={(value) => onFilterChange(value as 'active' | 'expired')}
      />
      <SearchField
        value={search}
        onChange={onSearchChange}
        placeholder="Search code, person, unit..."
      />
      {codes.length ? (
        <div className="stack-list">
          {codes.map((code) => (
            <article key={code.id} className="list-card code-card">
              <div className="list-card__copy">
                <div className="list-card__top">
                  <h2>{code.code}</h2>
                  <span className={`pill ${statusClass(code.status)}`}>{statusLabel(code.status)}</span>
                </div>
                <p>
                  {code.person} • {code.purpose}
                </p>
                <p>{code.validUntil}</p>
              </div>
              <div className="card-actions">
                <button type="button" className="ghost-icon" onClick={() => onCopy(code.code)} aria-label={`Copy ${code.code}`}>
                  <Icon name="copy" />
                </button>
                <button type="button" className="ghost-icon" onClick={() => onCopy(`${code.code} shared`)} aria-label={`Share ${code.code}`}>
                  <Icon name="share" />
                </button>
                {code.status !== 'expired' ? (
                  <button
                    type="button"
                    className="revoke-button"
                    onClick={() => onRevoke(code.id)}
                    aria-label={`Revoke ${code.code}`}
                  >
                    Revoke
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No active codes yet"
          description="Create a visitor or delivery code to see it listed here."
        />
      )}
    </section>
  )
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="search-field">
      <span className="search-icon">
        <Icon name="search" />
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

function SegmentedControl({
  items,
  activeKey,
  onChange,
}: {
  items: readonly { key: string; label: string }[]
  activeKey: string
  onChange: (value: string) => void
}) {
  return (
    <div className="segmented-control" role="tablist">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={item.key === activeKey ? 'segment segment-active' : 'segment'}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function TabBar({
  activeRoute,
  onNavigate,
}: {
  activeRoute: RouteKey
  onNavigate: (route: RouteKey) => void
}) {
  return (
    <nav className="tab-bar" aria-label="Primary">
      <div className="tab-bar__pill">
        {tabs.map((tab) => {
          const active = tab.key === activeRoute
          return (
            <button
              key={tab.key}
              type="button"
              className={active ? 'tab-item tab-item-active' : 'tab-item'}
              onClick={() => onNavigate(tab.key)}
            >
              <span className="tab-icon">
                <Icon name={tab.icon} active={active} />
              </span>
              <span className="tab-label">{tab.shortLabel}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon name="spark" />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}

function statusClass(status: VisitorStatus | DeliveryStatus | CodeStatus) {
  switch (status) {
    case 'checked-in':
    case 'active':
      return 'pill-blue'
    case 'expected':
      return 'pill-green'
    case 'pending':
    case 'waiting':
      return 'pill-slate'
    case 'expired':
      return 'pill-red'
    default:
      return 'pill-slate'
  }
}

function statusLabel(status: VisitorStatus | DeliveryStatus | CodeStatus) {
  switch (status) {
    case 'checked-in':
      return 'Checked in'
    case 'expected':
      return 'Expected'
    case 'waiting':
      return 'Waiting'
    case 'active':
      return 'Active'
    case 'pending':
      return 'Pending'
    case 'expired':
      return 'Expired'
    default:
      return status
  }
}

export default App
