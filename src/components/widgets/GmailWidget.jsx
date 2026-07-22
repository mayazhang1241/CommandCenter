import { useState, useEffect, useCallback } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Mail, RefreshCw, ExternalLink, LogOut } from 'lucide-react'
import Widget from '../Widget'
import styles from './GmailWidget.module.css'

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'
const MAX_RESULTS = 6

function getStoredToken() {
  try {
    const stored = localStorage.getItem('gmail_token')
    if (!stored) return null
    const { access_token, expires_at } = JSON.parse(stored)
    if (Date.now() > expires_at) {
      localStorage.removeItem('gmail_token')
      return null
    }
    return access_token
  } catch {
    return null
  }
}

function parseSender(fromHeader) {
  if (!fromHeader) return 'Unknown'
  const match = fromHeader.match(/^"?([^"<]+?)"?\s*<[^>]+>$/)
  if (match) return match[1].trim()
  return fromHeader.split('@')[0]
}

function getHeader(headers, name) {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

function formatEmailTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diffHours = (Date.now() - date) / 3_600_000
  if (diffHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (diffHours < 168) return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Outer shell — only mounts the inner component (which calls useGoogleLogin)
// when VITE_GOOGLE_CLIENT_ID is set, because the hook requires GoogleOAuthProvider.
export default function GmailWidget() {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <Widget title="Gmail" icon={<Mail size={14} />}>
        <div className={styles.state}>
          <span className={styles.stateText}>Add VITE_GOOGLE_CLIENT_ID to .env to enable Gmail</span>
        </div>
      </Widget>
    )
  }
  return <GmailWidgetInner />
}

function GmailWidgetInner() {
  const [token, setToken] = useState(getStoredToken)
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useGoogleLogin({
    scope: GMAIL_SCOPE,
    onSuccess: ({ access_token, expires_in = 3600 }) => {
      const payload = { access_token, expires_at: Date.now() + (expires_in - 60) * 1000 }
      localStorage.setItem('gmail_token', JSON.stringify(payload))
      setToken(access_token)
    },
    onError: () => setError('Sign-in failed. Please try again.'),
  })

  const fetchEmails = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const q = encodeURIComponent('in:inbox (is:unread OR label:important)')
      const listRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${q}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (listRes.status === 401) {
        localStorage.removeItem('gmail_token')
        setToken(null)
        return
      }
      const { messages = [] } = await listRes.json()

      // Fetch details for all returned messages so we can sort by priority across the full set
      const details = await Promise.all(
        messages.map(({ id }) =>
          fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(r => r.json())
        )
      )

      const parsed = details.map(msg => {
        const headers = msg.payload?.headers ?? []
        const isUnread = msg.labelIds?.includes('UNREAD') ?? false
        const isImportant = msg.labelIds?.includes('IMPORTANT') ?? false
        return {
          id: msg.id,
          threadId: msg.threadId,
          sender: parseSender(getHeader(headers, 'From')),
          subject: getHeader(headers, 'Subject') || '(no subject)',
          snippet: msg.snippet ?? '',
          date: getHeader(headers, 'Date'),
          isUnread,
          isImportant,
          score: (isUnread ? 2 : 0) + (isImportant ? 1 : 0),
        }
      })
      parsed.sort((a, b) => b.score - a.score)
      setEmails(parsed.slice(0, MAX_RESULTS))
    } catch {
      setError('Failed to load emails.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchEmails() }, [fetchEmails])

  const disconnect = () => {
    localStorage.removeItem('gmail_token')
    setToken(null)
    setEmails([])
    setError(null)
  }

  const headerAction = token && (
    <div className={styles.actions}>
      <button
        className={styles.actionBtn}
        onClick={fetchEmails}
        disabled={loading}
        title="Refresh"
      >
        <RefreshCw size={13} className={loading ? styles.spinning : undefined} />
      </button>
      <button
        className={styles.actionBtn}
        onClick={() => window.open('https://mail.google.com', '_blank')}
        title="Open Gmail"
      >
        <ExternalLink size={13} />
      </button>
      <button
        className={styles.actionBtn}
        onClick={disconnect}
        title="Disconnect Gmail"
      >
        <LogOut size={13} />
      </button>
    </div>
  )

  return (
    <Widget title="Gmail" icon={<Mail size={14} />} action={headerAction}>
      {!token ? (
        <div className={styles.connectState}>
          <p className={styles.connectHint}>Connect Gmail to see your priority inbox</p>
          <button className={styles.connectBtn} onClick={() => login()}>
            Sign in with Google
          </button>
        </div>
      ) : loading && emails.length === 0 ? (
        <div className={styles.skeletons}>
          {Array.from({ length: 5 }, (_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : error ? (
        <div className={styles.state}>
          <span className={styles.stateText}>{error}</span>
          <button className={styles.retryBtn} onClick={fetchEmails}>Retry</button>
        </div>
      ) : emails.length === 0 ? (
        <div className={styles.state}>
          <span className={styles.stateText}>No priority emails — inbox is clear</span>
        </div>
      ) : (
        <ul className={styles.list}>
          {emails.map(email => (
            <li
              key={email.id}
              className={`${styles.row} ${email.isUnread ? styles.rowUnread : ''}`}
              onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`, '_blank')}
            >
              <span className={email.isUnread ? styles.dot : styles.dotPlaceholder} />
              <div className={styles.rowBody}>
                <div className={styles.rowTop}>
                  <span className={styles.sender}>{email.sender}</span>
                  <span className={styles.time}>{formatEmailTime(email.date)}</span>
                </div>
                <div className={styles.subject}>{email.subject}</div>
                <div className={styles.snippet}>{email.snippet}</div>
              </div>
              {email.isImportant && (
                <span className={styles.importantMarker} title="Marked important" />
              )}
            </li>
          ))}
        </ul>
      )}
    </Widget>
  )
}
