import { useEffect, useState } from 'react'

type View = 'order' | 'kitchen' | 'owner'
type OrderStatus = 'new' | 'cooking' | 'ready' | 'out' | 'done'
type Fulfilment = 'collect' | 'delivery'
type PayMethod = 'payfast' | 'cash'
type MenuVariant = [string, string]

type MenuItem = {
  id: number
  name: string
  short: string
  price: number
  desc?: string
  variants?: MenuVariant[]
}

type Extra = { id: string; name: string; price: number }
type CartLine = {
  id: number
  extras: string[]
  qty: number
  variant: number | null
}
type Order = {
  id: string
  name: string
  phone: string
  items: CartLine[]
  type: Fulfilment
  address: string
  pay: PayMethod
  paid: boolean
  status: OrderStatus
  created: number
  note: string
  demo?: boolean
}
type CustomerMessage = {
  from: string
  order?: string
  text: string
  at: number
}
type ToastMessage = { id: number; title: string; body: string }
type ItemDraft = { id: number; extras: string[]; qty: number; variant: number | null }
type Modal = 'item' | 'cart' | 'payfast' | null

const MENU: MenuItem[] = [
  { id: 1, name: 'Classic RasKota', short: 'Classic', price: 35, desc: 'Atchaar, chips, polony, cheese, vienna' },
  {
    id: 2,
    name: 'Loaded RasKota',
    short: 'Loaded',
    price: 45,
    variants: [
      ['With cheese griller', 'Polony, special garlic, cheese, egg, cheese griller'],
      ['With half russian', 'Polony, special garlic, cheese, egg, half russian'],
    ],
  },
  { id: 3, name: 'The Crunch Bossa', short: 'Crunch Bossa', price: 55, desc: 'Crumbed chicken burger, polony, special garlic, cheese, egg' },
  { id: 4, name: 'The RasKota Plug', short: 'Plug', price: 55, desc: 'Full russian, polony, special garlic, cheese, egg' },
  {
    id: 5,
    name: 'The Double Trouble',
    short: 'Double Trouble',
    price: 65,
    variants: [
      ['Russian & griller', 'Full russian, cheese griller, polony, special garlic, cheese, egg'],
      ['Chicken burger & griller', 'Crumbed chicken burger, polony, special garlic, cheese, egg, cheese griller'],
    ],
  },
  { id: 6, name: 'The Meat Lover', short: 'Meat Lover', price: 75, desc: 'Full russian, cheese griller, bacon, polony, special garlic, cheese, egg' },
  { id: 7, name: 'The Ultimate RasKota', short: 'Ultimate', price: 85, desc: 'Full russian, cheese griller, crumbed chicken burger, polony, special garlic, cheese, egg' },
]

const EXTRAS: Extra[] = [
  { id: 'egg', name: 'Egg', price: 6 },
  { id: 'cheese', name: 'Cheese', price: 6 },
  { id: 'vienna', name: 'Vienna', price: 8 },
  { id: 'griller', name: 'Cheese griller', price: 12 },
  { id: 'bacon', name: 'Bacon', price: 15 },
  { id: 'russian', name: 'Russian', price: 25 },
]

const DELIVERY = 20
const NAMES = ['Thabo', 'Lerato', 'Sipho', 'Ayanda', 'Kagiso', 'Zanele', 'Musa', 'Nandi', 'Bongani', 'Precious', 'Tshepo', 'Palesa', 'Lwazi', 'Neo', 'Karabo', 'Mpho', 'Dineo', 'Themba']
const STREETS = ['Gauntlet St', 'Pretoria Rd', 'Springbok St', 'Bonaero Dr', 'Rhodesfield Ave', 'Pongola Cres']
const STEPS: Record<OrderStatus, number> = { new: 0, cooking: 1, ready: 2, out: 2, done: 3 }

const R = (value: number) => 'R' + Math.round(value)
const menuItem = (id: number) => MENU.find((entry) => entry.id === id)!
const extraItem = (id: string) => EXTRAS.find((entry) => entry.id === id)!
const lineUnit = (line: CartLine) => menuItem(line.id).price + line.extras.reduce((sum, id) => sum + extraItem(id).price, 0)
const lineTotal = (line: CartLine) => lineUnit(line) * line.qty
const orderTotal = (order: Order) => order.items.reduce((sum, line) => sum + lineTotal(line), 0) + (order.type === 'delivery' ? DELIVERY : 0)
const minutesSince = (created: number, now: number) => Math.max(0, Math.floor((now - created) / 60000))
const hhmm = (date: number) => new Date(date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

function randomOrder(seq: number, ago: number, status: OrderStatus): Order {
  const count = 1 + (Math.random() < 0.45 ? 1 : 0) + (Math.random() < 0.15 ? 1 : 0)
  const items: CartLine[] = []

  for (let index = 0; index < count; index += 1) {
    const item = pick(MENU)
    items.push({
      id: item.id,
      variant: item.variants ? Math.floor(Math.random() * 2) : null,
      extras: Math.random() < 0.3 ? [pick(EXTRAS).id] : [],
      qty: Math.random() < 0.2 ? 2 : 1,
    })
  }

  const type: Fulfilment = Math.random() < 0.35 ? 'delivery' : 'collect'
  return {
    id: 'RK-' + seq,
    name: pick(NAMES),
    phone: '07' + Math.floor(10000000 + Math.random() * 89999999),
    items,
    type,
    address: type === 'delivery' ? (Math.floor(Math.random() * 90) + 1) + ' ' + pick(STREETS) : '',
    pay: Math.random() < 0.6 ? 'payfast' : 'cash',
    paid: false,
    status,
    created: Date.now() - ago * 60000,
    note: Math.random() < 0.15 ? 'Extra atchaar please' : '',
    demo: true,
  }
}

function createDemoSeed() {
  let nextSeq = 1040
  const orders: Order[] = []

  for (let index = 0; index < 26; index += 1) {
    const order = randomOrder(nextSeq++, 30 + Math.floor(Math.random() * 330), 'done')
    order.paid = true
    orders.push(order)
  }

  orders.sort((a, b) => a.created - b.created)
  ;(['ready', 'cooking', 'cooking', 'new', 'new'] as OrderStatus[]).forEach((status, index) => {
    const order = randomOrder(nextSeq++, [13, 8, 5, 2, 1][index], status)
    order.paid = order.pay === 'payfast'
    orders.push(order)
  })

  const messages: CustomerMessage[] = [
    { from: 'Lerato', text: 'Are you open on Sunday?', at: Date.now() - 55 * 60000 },
    { from: 'Musa', text: 'Can I order 10 kotas for Friday lunch at work?', at: Date.now() - 20 * 60000 },
  ]

  return { orders, nextSeq, messages }
}

function currentView(): View {
  if (typeof window === 'undefined') return 'order'
  const value = (window.location.hash || '#order').slice(1)
  return value === 'kitchen' || value === 'owner' ? value : 'order'
}

type OrderViewProps = {
  orders: Order[]
  mine: string | null
  stamps: number
  open: boolean
  wait: number
  soldOut: Record<number, boolean>
  installVisible: boolean
  onInstall: () => void
  onAdd: (id: number) => void
  message: string
  setMessage: (value: string) => void
  onSendMessage: () => void
}

function OrderView({
  orders,
  mine,
  stamps,
  open,
  wait,
  soldOut,
  installVisible,
  onInstall,
  onAdd,
  message,
  setMessage,
  onSendMessage,
}: OrderViewProps) {
  const myOrder = orders.find((order) => order.id === mine)
  let tracker = null

  if (myOrder && myOrder.status !== 'done') {
    const step = STEPS[myOrder.status]
    const delivery = myOrder.type === 'delivery'
    const ahead = orders.filter((order) => ['new', 'cooking'].includes(order.status) && order.created < myOrder.created).length
    const label: Record<string, string> = {
      new: 'Order received',
      cooking: 'On the grill',
      ready: delivery ? 'Packed for delivery' : 'Ready for collection',
      out: 'On its way to you',
    }
    const waitLabel = myOrder.status === 'new' || myOrder.status === 'cooking'
      ? ahead + ' order' + (ahead === 1 ? '' : 's') + ' ahead of you · about ' + Math.max(4, ahead * 4 + 6) + ' min'
      : delivery ? myOrder.address : '11 Gauntlet Street, Rhodesfield'

    tracker = (
      <div className="tracker">
        <div className="tracker-head">
          <div>
            <div className="eyebrow">Your order {myOrder.id}</div>
            <h3>{label[myOrder.status]}</h3>
            <div className="muted" style={{ fontSize: 13 }}>{waitLabel}</div>
          </div>
          <span className="pill num">{R(orderTotal(myOrder))}</span>
        </div>
        <div className="steps">
          {['Received', 'Cooking', delivery ? 'On the way' : 'Ready', 'Done'].map((labelText, index) => (
            <div className={'step ' + (index <= step ? 'on' : '')} key={labelText}>
              <i />
              <span>{labelText}</span>
            </div>
          ))}
        </div>
        <div className="msg-row">
          <input
            type="text"
            aria-label="Message RasKota about this order"
            placeholder="Message RasKota about this order"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button className="btn sm" id="sendMsg" type="button" onClick={onSendMessage}>Send</button>
        </div>
      </div>
    )
  }

  return (
    <div className="phone">
      {installVisible && (
        <div className="install">
          <div className="ic">RK</div>
          <p><b>Add RasKota to your home screen</b><br /><span className="muted">Order in two taps and get a ping when your kota is ready.</span></p>
          <button className="btn sm" type="button" onClick={onInstall}>Install</button>
        </div>
      )}
      <div className="hero">
        <div className="eyebrow">Made fresh to order · Rhodesfield</div>
        <h1>Big flavour.<br /><span>Bigger kotas.</span></h1>
        <div className="status-row">
          <span className="pill"><i className={'dot ' + (open ? '' : 'closed')} />{open ? 'Open now' : 'Closed'}</span>
          {open && <span className="pill num">~{wait} min wait</span>}
          <span className="pill">Delivery R20</span>
        </div>
      </div>
      {tracker}
      <div className="loyalty">
        <div style={{ flex: 'none' }}>
          <b>Kota card</b>
          <span className="muted" style={{ fontSize: 12.5 }}>{stamps}/9 · 10th is free</span>
        </div>
        <div className="stamps">
          {Array.from({ length: 10 }, (_, index) => (
            <div className={'stamp ' + (index < stamps ? 'got ' : '') + (index === 9 ? 'free' : '')} key={index}>
              {index === 9 ? 'FREE' : ''}
            </div>
          ))}
        </div>
      </div>
      <div className="sec-title"><h2>Menu</h2><span className="muted" style={{ fontSize: 13 }}>Tap to build your kota</span></div>
      <div className="menu">
        {MENU.map((item) => {
          const sold = Boolean(soldOut[item.id])
          return (
            <div className={'item ' + (sold ? 'out' : '')} key={item.id}>
              <div className="n">{item.id}</div>
              <div style={{ minWidth: 0 }}>
                <h3>{item.name}</h3>
                <p>
                  {item.desc || item.variants?.map((variant) => variant[1]).join(' or ')}
                </p>
              </div>
              <div className="right">
                <span className="price"><b className="num">{R(item.price)}</b></span>
                {sold
                  ? <span className="soldout">Sold out</span>
                  : <button className="btn sm primary" type="button" data-add={item.id} disabled={!open} onClick={() => onAdd(item.id)}>Add</button>}
              </div>
            </div>
          )
        })}
      </div>
      <div className="sec-title"><h2>Extras</h2></div>
      <div className="extras-strip">
        {EXTRAS.map((extra) => (
          <div className="extra" key={extra.id}><span>{extra.name}</span><span className="num">{R(extra.price)}</span></div>
        ))}
      </div>
      <div className="find">
        <span className="eyebrow">Find us</span>
        <b>11 Gauntlet Street, Rhodesfield</b>
        <span className="muted">Prefer WhatsApp? 071 533 7375 still works. App orders skip the queue.</span>
      </div>
    </div>
  )
}

type TicketProps = {
  order: Order
  mine: string | null
  now: number
  onStatus: (id: string, status: OrderStatus) => void
}

function Ticket({ order, mine, now, onStatus }: TicketProps) {
  const elapsed = minutesSince(order.created, now)
  const urgent = order.status === 'new' || order.status === 'cooking'
  const urgencyClass = urgent && elapsed >= 15 ? 'crit' : urgent && elapsed >= 10 ? 'warn' : ''
  const delivery = order.type === 'delivery'
  let action: { label: string; status: OrderStatus; className: string } | null = null

  if (order.status === 'new') action = { label: 'Start cooking', status: 'cooking', className: 'btn primary' }
  if (order.status === 'cooking') action = { label: 'Mark ready', status: 'ready', className: 'btn hot' }
  if (order.status === 'ready') action = delivery
    ? { label: 'Out for delivery', status: 'out', className: 'btn primary' }
    : { label: 'Collected', status: 'done', className: 'btn primary' }
  if (order.status === 'out') action = { label: 'Delivered', status: 'done', className: 'btn primary' }

  return (
    <article className={'ticket ' + urgencyClass}>
      <div className="t-head">
        <span className="t-id">{order.id.slice(3)}</span>
        <span className="t-time num">{elapsed} min</span>
      </div>
      <div>
        <b style={{ fontSize: 15 }}>{order.name}</b>
        {mine === order.id && <> <span className="chip">You</span></>}
      </div>
      <div className="t-meta">
        <span className={'chip ' + (delivery ? 'del' : '')}>{delivery ? 'Deliver' : 'Collect'}</span>
        {order.paid
          ? <span className="chip paid">Paid {R(orderTotal(order))}</span>
          : <span className="chip cash">Cash due {R(orderTotal(order))}</span>}
      </div>
      {delivery && <div style={{ fontSize: 13 }}>{order.address}</div>}
      <ul className="t-items">
        {order.items.map((line, index) => {
          const item = menuItem(line.id)
          return (
            <li key={order.id + '-' + index}>
              <b>{line.qty} × {item.short}</b>
              {item.variants && <small>{item.variants[line.variant ?? 0][0]}</small>}
              {line.extras.length > 0 && <em>+ {line.extras.map((id) => extraItem(id).name).join(', ')}</em>}
            </li>
          )
        })}
      </ul>
      {order.note && <div className="t-note">{order.note}</div>}
      {action && (
        <div className="t-btns">
          <button className={action.className} type="button" onClick={() => onStatus(order.id, action!.status)}>
            {action.label}
          </button>
        </div>
      )}
    </article>
  )
}

type KitchenViewProps = {
  orders: Order[]
  mine: string | null
  busy: boolean
  open: boolean
  now: number
  onBusy: () => void
  onRush: () => void
  onOpen: () => void
  onStatus: (id: string, status: OrderStatus) => void
}

function KitchenView({ orders, mine, busy, open, now, onBusy, onRush, onOpen, onStatus }: KitchenViewProps) {
  const columns: [string, OrderStatus][] = [['New', 'new'], ['On the grill', 'cooking'], ['Ready & out', 'ready']]

  return (
    <>
      <div className="k-top">
        <div><div className="eyebrow">Kitchen screen · tablet on the truck</div><h1>Order queue</h1></div>
        <div className="k-actions">
          <button className={'btn sm ' + (busy ? 'hot' : '')} id="busyBtn" type="button" onClick={onBusy}>
            {busy ? 'Busy mode on (+10 min)' : 'Busy mode'}
          </button>
          <button className="btn sm" id="rushBtn" type="button" onClick={onRush}>Simulate a rush</button>
          <button className={'btn sm ' + (open ? '' : 'primary')} id="openBtn" type="button" onClick={onOpen}>
            {open ? 'Pause orders' : 'Open for orders'}
          </button>
        </div>
      </div>
      <div className="board">
        {columns.map(([title, status]) => {
          const list = orders
            .filter((order) => status === 'ready'
              ? ['ready', 'out'].includes(order.status)
              : order.status === status)
            .sort((a, b) => a.created - b.created)

          return (
            <div className="col" key={status}>
              <div className="col-h"><b>{title}</b><span className="count num">{list.length}</span></div>
              {list.length > 0
                ? list.map((order) => <Ticket key={order.id} order={order} mine={mine} now={now} onStatus={onStatus} />)
                : <div className="empty">Nothing here</div>}
            </div>
          )
        })}
      </div>
    </>
  )
}

type OwnerViewProps = {
  orders: Order[]
  messages: CustomerMessage[]
  open: boolean
  soldOut: Record<number, boolean>
  subscribers: number
  onToggleAvailability: (id: number) => void
  onBroadcast: (message: string) => void
  onCopyBroadcast: (message: string) => void
}

function OwnerView({
  orders,
  messages,
  open,
  soldOut,
  subscribers,
  onToggleAvailability,
  onBroadcast,
  onCopyBroadcast,
}: OwnerViewProps) {
  const revenue = orders.reduce((sum, order) => sum + orderTotal(order), 0)
  const count = orders.length
  const payfastRevenue = orders.filter((order) => order.pay === 'payfast').reduce((sum, order) => sum + orderTotal(order), 0)
  const deliveries = orders.filter((order) => order.type === 'delivery').length
  const now = new Date()
  const hours = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(now)
    start.setMinutes(0, 0, 0)
    start.setHours(start.getHours() - (6 - index))
    return start.getTime()
  })
  const hourlyRevenue = hours.map((start) => orders
    .filter((order) => order.created >= start && order.created < start + 3600000)
    .reduce((sum, order) => sum + orderTotal(order), 0))
  const maxHour = Math.max(...hourlyRevenue, 1)
  const productCounts = new Map<number, number>()
  const extraCounts = new Map<string, number>()

  orders.forEach((order) => order.items.forEach((line) => {
    productCounts.set(line.id, (productCounts.get(line.id) ?? 0) + line.qty)
    line.extras.forEach((id) => extraCounts.set(id, (extraCounts.get(id) ?? 0) + line.qty))
  }))

  const bestSellers = Array.from(productCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxBestSeller = bestSellers.length > 0 ? bestSellers[0][1] : 1
  const topExtra = Array.from(extraCounts.entries()).sort((a, b) => b[1] - a[1])[0]
  const [broadcast, setBroadcast] = useState('Lunch special: Classic RasKota + extra cheese for R39 until 2pm. Order in the app.')

  return (
    <div className="o-wrap">
      <header>
        <div><div className="eyebrow">Owner dashboard · today · example data</div><h1>How today is going</h1></div>
        <span className="pill"><i className={'dot ' + (open ? '' : 'closed')} />{open ? 'Taking orders' : 'Paused'}</span>
      </header>
      <div className="kpis">
        <div className="kpi"><span>Takings</span><b className="num">{R(revenue)}</b><small>{count} orders</small></div>
        <div className="kpi"><span>Average order</span><b className="num">{R(revenue / Math.max(count, 1))}</b><small>{topExtra ? 'Top extra: ' + extraItem(topExtra[0]).name : 'No extras yet'}</small></div>
        <div className="kpi"><span>Paid upfront</span><b className="num">{Math.round(payfastRevenue / Math.max(revenue, 1) * 100)}%</b><small>{R(payfastRevenue)} via PayFast</small></div>
        <div className="kpi"><span>Deliveries</span><b className="num">{deliveries}</b><small>{R(deliveries * DELIVERY)} in delivery fees</small></div>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-h"><h2>Takings by hour</h2><span className="muted" style={{ fontSize: 13 }}>Plan prep and staff around the peaks</span></div>
          <div className="bars">
            {hourlyRevenue.map((value, index) => (
              <div className={'bar-c ' + (index === 6 ? 'now' : '')} key={hours[index]}>
                <em className="num">{value ? R(value) : ''}</em>
                <i style={{ height: (value / maxHour * 100) + '%' }} />
              </div>
            ))}
          </div>
          <div className="bar-x">
            {hours.map((start, index) => <span key={start}>{index === 6 ? 'Now' : new Date(start).getHours() + ':00'}</span>)}
          </div>
          <div className="split" aria-hidden="true">
            <i style={{ width: (payfastRevenue / Math.max(revenue, 1) * 100) + '%' }} />
            <i style={{ flex: 1 }} />
          </div>
          <div className="legend">
            <span><i className="sw" style={{ background: 'var(--amber)' }} />PayFast <b className="num">{R(payfastRevenue)}</b></span>
            <span><i className="sw" style={{ background: '#7b6a55' }} />Cash <b className="num">{R(revenue - payfastRevenue)}</b></span>
          </div>
        </div>
        <div className="card">
          <h2>Best sellers</h2>
          <ol className="rank">
            {bestSellers.map(([id, amount]) => (
              <li key={id}>
                <span>{menuItem(id).name}</span>
                <b className="num">{amount}</b>
                <span className="track"><i style={{ width: (amount / maxBestSeller * 100) + '%' }} /></span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-h"><h2>Send a push to customers</h2><span className="muted num" style={{ fontSize: 13 }}>{subscribers} app users</span></div>
          <textarea id="bcast" aria-label="Message to customers" value={broadcast} onChange={(event) => setBroadcast(event.target.value)} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn primary" id="sendBcast" type="button" onClick={() => onBroadcast(broadcast)}>Send push</button>
            <button className="btn" id="copyBcast" type="button" onClick={() => onCopyBroadcast(broadcast)}>Copy for WhatsApp group</button>
          </div>
          <span className="muted" style={{ fontSize: 12.5 }}>Every phone with the app gets it instantly. The copy button gives you the same text for the WhatsApp group.</span>
        </div>
        <div className="card">
          <h2>Menu availability</h2>
          <div>
            {MENU.map((item) => (
              <div className="toggle-row" key={item.id}>
                <span>{item.name}</span>
                <button
                  className="sw-btn"
                  type="button"
                  role="switch"
                  aria-checked={!soldOut[item.id]}
                  data-so={item.id}
                  aria-label={item.name + ' available'}
                  onClick={() => onToggleAvailability(item.id)}
                />
              </div>
            ))}
          </div>
          <span className="muted" style={{ fontSize: 12.5 }}>Switch an item off when you run out of russians and customers see it as sold out.</span>
        </div>
      </div>
      <div className="grid2">
        <div className="card">
          <h2>Customer messages</h2>
          <div className="inbox">
            {messages.slice().reverse().map((message, index) => (
              <div className="msg" key={message.at + '-' + index}>
                <small>{message.from}{message.order ? ' · ' + message.order : ''} · {hhmm(message.at)}</small>
                {message.text}
              </div>
            ))}
            {messages.length === 0 && <div className="empty">No messages</div>}
          </div>
        </div>
        <div className="card">
          <h2>Customers</h2>
          <div className="toggle-row"><span>App users</span><b className="num">{subscribers}</b></div>
          <div className="toggle-row"><span>WhatsApp group members</span><b className="num">140</b></div>
          <div className="toggle-row"><span>Repeat customers this week</span><b className="num">41</b></div>
          <div className="toggle-row"><span>Free kotas earned (loyalty)</span><b className="num">6</b></div>
        </div>
      </div>
      <div className="card">
        <h2>What comes next</h2>
        <div className="roadmap">
          <div><b>Live in 2 weeks</b><ul><li>Ordering app on its own web address</li><li>Kitchen screen on a tablet</li><li>PayFast payments</li><li>Ready and delivery notifications</li></ul></div>
          <div><b>Month 2</b><ul><li>Kota card loyalty</li><li>Push specials to customers</li><li>Driver view with map link</li><li>Daily sales summary on WhatsApp</li></ul></div>
          <div><b>Later</b><ul><li>Pre-orders for offices and events</li><li>Stock count for bread, russians, chips</li><li>Simple bookkeeping export</li></ul></div>
        </div>
      </div>
    </div>
  )
}

export function RasKotaApp() {
  const [seed] = useState(() => createDemoSeed())
  const [orders, setOrders] = useState<Order[]>(seed.orders)
  const [seq, setSeq] = useState(seed.nextSeq)
  const [messages, setMessages] = useState<CustomerMessage[]>(seed.messages)
  const [view, setView] = useState<View>('order')
  const [cart, setCart] = useState<CartLine[]>([])
  const [mine, setMine] = useState<string | null>(null)
  const [open, setOpen] = useState(true)
  const [busy, setBusy] = useState(false)
  const [soldOut, setSoldOut] = useState<Record<number, boolean>>({})
  const [stamps, setStamps] = useState(6)
  const [subscribers] = useState(182)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [draftType, setDraftType] = useState<Fulfilment>('collect')
  const [draftPay, setDraftPay] = useState<PayMethod>('payfast')
  const [draftAddress, setDraftAddress] = useState('')
  const [draftNote, setDraftNote] = useState('')
  const [itemDraft, setItemDraft] = useState<ItemDraft>({ id: 1, extras: [], qty: 1, variant: null })
  const [modal, setModal] = useState<Modal>(null)
  const [cartError, setCartError] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [installVisible, setInstallVisible] = useState(true)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [clock, setClock] = useState(Date.now())

  useEffect(() => {
    const updateView = () => setView(currentView())
    updateView()
    window.addEventListener('hashchange', updateView)
    return () => window.removeEventListener('hashchange', updateView)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 20000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!modal) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal])

  const notify = (title: string, body: string) => {
    const id = Date.now() + Math.floor(Math.random() * 10000)
    setToasts((current) => [...current, { id, title, body }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4800)
  }

  const activeOrders = orders.filter((order) => ['new', 'cooking'].includes(order.status))
  const wait = Math.max(8, activeOrders.length * 4 + 6 + (busy ? 10 : 0))
  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0)
  const cartTotal = cart.reduce((sum, line) => sum + lineTotal(line), 0)
  const currentItem = menuItem(itemDraft.id)
  const itemDraftTotal = lineTotal(itemDraft)
  const modalTotal = cartTotal + (draftType === 'delivery' ? DELIVERY : 0)

  const openItem = (id: number) => {
    setItemDraft({ id, extras: [], qty: 1, variant: menuItem(id).variants ? 0 : null })
    setModal('item')
  }

  const openCart = (error = '') => {
    setCartError(error)
    setModal('cart')
  }

  const addItemToCart = () => {
    setCart((current) => [...current, { ...itemDraft, extras: [...itemDraft.extras] }])
    setModal(null)
    notify('Added to your order', itemDraft.qty + ' × ' + currentItem.name)
  }

  const removeCartLine = (index: number) => {
    setCart((current) => current.filter((_, currentIndex) => currentIndex !== index))
    if (cart.length <= 1) setModal(null)
  }

  const completeOrder = (paid: boolean) => {
    const order: Order = {
      id: 'RK-' + seq,
      name: customerName.trim(),
      phone: customerPhone,
      items: cart.map((line) => ({ ...line, extras: [...line.extras] })),
      type: draftType,
      address: draftAddress,
      pay: draftPay,
      paid,
      status: 'new',
      created: Date.now(),
      note: draftNote,
    }
    setSeq((current) => current + 1)
    setOrders((current) => [...current, order])
    setMine(order.id)
    setCart([])
    setDraftNote('')
    setModal(null)
    setPaymentProcessing(false)
    notify('Order ' + order.id + ' received', paid
      ? 'Paid ' + R(orderTotal(order)) + '. We will ping you when it is ready.'
      : 'Pay ' + R(orderTotal(order)) + ' cash on ' + (order.type === 'delivery' ? 'delivery' : 'collection') + '.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const placeOrder = () => {
    if (!customerName.trim()) {
      openCart('Add your name so the kitchen can call it out.')
      return
    }
    if (!/^0\d{9}$/.test(customerPhone.replace(/\s/g, ''))) {
      openCart('Enter a 10-digit cellphone number, e.g. 071 533 7375.')
      return
    }
    if (draftType === 'delivery' && !draftAddress.trim()) {
      openCart('Add a delivery address.')
      return
    }
    if (draftPay === 'payfast') setModal('payfast')
    else completeOrder(false)
  }

  const startDemoPayment = () => {
    setPaymentProcessing(true)
    window.setTimeout(() => completeOrder(true), 900)
  }

  const setOrderStatus = (id: string, status: OrderStatus) => {
    const order = orders.find((entry) => entry.id === id)
    if (!order) return
    setOrders((current) => current.map((entry) => entry.id === id
      ? { ...entry, status, paid: status === 'done' ? true : entry.paid }
      : entry))

    if (order.id === mine) {
      const delivery = order.type === 'delivery'
      const messagesByStatus: Partial<Record<OrderStatus, [string, string]>> = {
        cooking: ['Your kota is on the grill', 'Order ' + order.id + ' is being made now.'],
        ready: delivery
          ? ['Packed and ready', 'Order ' + order.id + ' leaves with the driver shortly.']
          : ['Your kota is ready!', 'Come collect ' + order.id + ' at 11 Gauntlet Street.'],
        out: ['On its way', 'Your driver is heading to ' + order.address + '.'],
        done: ['Enjoy!', 'Thanks for ordering. Stamp added to your kota card.'],
      }
      const message = messagesByStatus[status]
      if (message) notify(message[0], message[1])
      if (status === 'done') setStamps((current) => Math.min(9, current + 1))
    }
  }

  const sendCustomerMessage = () => {
    const value = messageDraft.trim()
    if (!value) return
    setMessages((current) => [...current, {
      from: customerName || 'You',
      order: mine ?? undefined,
      text: value,
      at: Date.now(),
    }])
    setMessageDraft('')
    notify('Message sent', 'RasKota will reply here.')
  }

  const simulateRush = () => {
    const newOrders = Array.from({ length: 4 }, (_, index) => {
      const order = randomOrder(seq + index, 0, 'new')
      order.created = Date.now() - index * 20000
      order.paid = order.pay === 'payfast'
      return order
    })
    setSeq((current) => current + newOrders.length)
    setOrders((current) => [...current, ...newOrders])
    notify('4 new orders', 'The queue updates the moment they pay.')
  }

  const sendBroadcast = (message: string) => {
    if (!message.trim()) return
    notify('RasKota', message.trim())
    window.setTimeout(() => notify('Push sent', 'Delivered to ' + subscribers + ' phones.'), 600)
  }

  const copyBroadcast = (message: string) => {
    if (!message.trim()) return
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(message).then(
        () => notify('Copied', 'Paste it into the WhatsApp group.'),
        () => {
          const field = document.getElementById('bcast') as HTMLTextAreaElement | null
          field?.select()
          notify('Text selected', 'Copy it and paste into the group.')
        },
      )
    } else {
      const field = document.getElementById('bcast') as HTMLTextAreaElement | null
      field?.select()
      notify('Text selected', 'Copy it and paste into the group.')
    }
  }

  const onOverlayClick = () => {
    if (!paymentProcessing) setModal(null)
  }

  return (
    <>
      <div className="bar">
        <div className="logo" aria-label="RasKota"><span className="ras">Ras</span><span className="kota">Kota</span></div>
        <span className="demo-tag">Live demo</span>
        <nav className="roles" aria-label="Switch view">
          <a href="#order" data-v="order" aria-current={view === 'order' ? 'page' : undefined}>Customer</a>
          <a href="#kitchen" data-v="kitchen" aria-current={view === 'kitchen' ? 'page' : undefined}>Kitchen</a>
          <a href="#owner" data-v="owner" aria-current={view === 'owner' ? 'page' : undefined}>Owner</a>
        </nav>
      </div>

      <main>
        <section className="view" id="v-order" hidden={view !== 'order'}>
          <OrderView
            orders={orders}
            mine={mine}
            stamps={stamps}
            open={open}
            wait={wait}
            soldOut={soldOut}
            installVisible={installVisible}
            onInstall={() => { setInstallVisible(false); notify('RasKota installed', 'It now opens from your home screen like any app.') }}
            onAdd={openItem}
            message={messageDraft}
            setMessage={setMessageDraft}
            onSendMessage={sendCustomerMessage}
          />
        </section>
        <section className="view" id="v-kitchen" hidden={view !== 'kitchen'}>
          <KitchenView
            orders={orders}
            mine={mine}
            busy={busy}
            open={open}
            now={clock}
            onBusy={() => setBusy((current) => !current)}
            onRush={simulateRush}
            onOpen={() => setOpen((current) => !current)}
            onStatus={setOrderStatus}
          />
        </section>
        <section className="view" id="v-owner" hidden={view !== 'owner'}>
          <OwnerView
            orders={orders}
            messages={messages}
            open={open}
            soldOut={soldOut}
            subscribers={subscribers}
            onToggleAvailability={(id) => setSoldOut((current) => ({ ...current, [id]: !current[id] }))}
            onBroadcast={sendBroadcast}
            onCopyBroadcast={copyBroadcast}
          />
        </section>
      </main>

      <div className="cartbar" hidden={view !== 'order' || cartCount === 0}>
        <button id="openCart" type="button" onClick={() => openCart()}>
          <span>{cartCount} item{cartCount === 1 ? '' : 's'} · View order</span>
          <span className="num">{R(cartTotal)}</span>
        </button>
      </div>

      {modal && (
        <div className="scrim" id="scrim" role="presentation" onClick={onOverlayClick}>
          <div className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            {modal === 'item' && (
              <>
                <div className="sheet-head">
                  <div><div className="eyebrow">#{currentItem.id} · {R(currentItem.price)}</div><h2>{currentItem.name}</h2></div>
                  <button className="x" type="button" onClick={() => setModal(null)} aria-label="Close">×</button>
                </div>
                {currentItem.variants
                  ? <div className="grp">
                      <span>Choose your build</span>
                      {currentItem.variants.map((variant, index) => (
                        <label className="opt" key={variant[0]}>
                          <input
                            type="radio"
                            name="variant"
                            value={index}
                            checked={(itemDraft.variant ?? 0) === index}
                            onChange={() => setItemDraft((current) => ({ ...current, variant: index }))}
                          />
                          <span className="lbl"><b>{variant[0]}</b><br /><span className="muted">{variant[1]}</span></span>
                        </label>
                      ))}
                    </div>
                  : <p className="muted" style={{ margin: 0 }}>{currentItem.desc}</p>}
                <div className="grp">
                  <span>Add extras</span>
                  {EXTRAS.map((extra) => (
                    <label className="opt" key={extra.id}>
                      <input
                        type="checkbox"
                        checked={itemDraft.extras.includes(extra.id)}
                        onChange={(event) => setItemDraft((current) => ({
                          ...current,
                          extras: event.target.checked
                            ? [...current.extras, extra.id]
                            : current.extras.filter((id) => id !== extra.id),
                        }))}
                      />
                      <span className="lbl">{extra.name}</span>
                      <span className="add num">+{R(extra.price)}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div className="qty">
                    <button type="button" aria-label="One less" onClick={() => setItemDraft((current) => ({ ...current, qty: Math.max(1, current.qty - 1) }))}>−</button>
                    <b className="num">{itemDraft.qty}</b>
                    <button type="button" aria-label="One more" onClick={() => setItemDraft((current) => ({ ...current, qty: Math.min(20, current.qty + 1) }))}>+</button>
                  </div>
                  <button className="btn primary" type="button" onClick={addItemToCart}>Add <span className="num">{R(itemDraftTotal)}</span></button>
                </div>
              </>
            )}

            {modal === 'cart' && (
              <>
                <div className="sheet-head"><h2>Your order</h2><button className="x" type="button" onClick={() => setModal(null)} aria-label="Close">×</button></div>
                {cart.map((line, index) => {
                  const item = menuItem(line.id)
                  return (
                    <div className="cart-item" key={line.id + '-' + index}>
                      <div>
                        <b>{line.qty} × {item.short}</b>
                        <small>
                          {item.variants ? item.variants[line.variant ?? 0][0] : ''}
                          {line.extras.length > 0 ? (item.variants ? ' · ' : '') + '+ ' + line.extras.map((id) => extraItem(id).name).join(', ') : ''}
                        </small>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="num">{R(lineTotal(line))}</span><br />
                        <button className="btn sm ghost" type="button" style={{ marginTop: 4 }} onClick={() => removeCartLine(index)}>Remove</button>
                      </div>
                    </div>
                  )
                })}
                <div className="grp">
                  <span>Collect or deliver</span>
                  <div className="seg">
                    <label>
                      <input type="radio" name="type" value="collect" checked={draftType === 'collect'} onChange={() => setDraftType('collect')} />
                      <b>Collect</b><small>11 Gauntlet St · ~{wait} min</small>
                    </label>
                    <label>
                      <input type="radio" name="type" value="delivery" checked={draftType === 'delivery'} onChange={() => setDraftType('delivery')} />
                      <b>Deliver</b><small>Around Rhodesfield · +R20</small>
                    </label>
                  </div>
                </div>
                {draftType === 'delivery' && (
                  <div className="grp">
                    <span>Delivery address</span>
                    <input type="text" placeholder="Street number and name" value={draftAddress} onChange={(event) => setDraftAddress(event.target.value)} />
                  </div>
                )}
                <div className="grp">
                  <span>Your details</span>
                  <input type="text" placeholder="Name" autoComplete="name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
                  <input type="tel" placeholder="Cellphone for order updates" autoComplete="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
                </div>
                <div className="grp">
                  <span>Notes for the kitchen</span>
                  <input type="text" placeholder="e.g. no atchaar" value={draftNote} onChange={(event) => setDraftNote(event.target.value)} />
                </div>
                <div className="grp">
                  <span>Payment</span>
                  <div className="seg">
                    <label>
                      <input type="radio" name="pay" value="payfast" checked={draftPay === 'payfast'} onChange={() => setDraftPay('payfast')} />
                      <b>Pay now</b><small>Card, Instant EFT, SnapScan</small>
                    </label>
                    <label>
                      <input type="radio" name="pay" value="cash" checked={draftPay === 'cash'} onChange={() => setDraftPay('cash')} />
                      <b>Cash</b><small>Pay when you {draftType === 'delivery' ? 'receive it' : 'collect'}</small>
                    </label>
                  </div>
                </div>
                <div className="line num"><span>Subtotal</span><span>{R(cartTotal)}</span></div>
                {draftType === 'delivery' && <div className="line num"><span>Delivery</span><span>{R(DELIVERY)}</span></div>}
                <div className="line total num"><span>Total</span><span>{R(modalTotal)}</span></div>
                {cartError && <p className="err">{cartError}</p>}
                <button className="btn primary" type="button" disabled={cart.length === 0} onClick={placeOrder}>
                  {draftPay === 'payfast' ? 'Continue to payment' : 'Place order'}
                </button>
              </>
            )}

            {modal === 'payfast' && (
              <>
                <div className="sheet-head"><h2>Secure payment</h2><button className="x" type="button" onClick={() => setModal(null)} aria-label="Close">×</button></div>
                <div className="pf">
                  <div className="pfh"><span>PayFast checkout</span><span>Demo · no money moves</span></div>
                  <small>Paying RasKota</small>
                  <div className="amt num">{R(modalTotal)}.00</div>
                  <button type="button" disabled={paymentProcessing} onClick={startDemoPayment}>{paymentProcessing ? 'Processing…' : 'Card (Visa / Mastercard)'}</button>
                  <button type="button" disabled={paymentProcessing} onClick={startDemoPayment}>Instant EFT</button>
                  <button type="button" disabled={paymentProcessing} onClick={startDemoPayment}>SnapScan</button>
                  <small>In a live build, this step must be connected to a verified payment gateway. This demonstration does not move money.</small>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="toasts" id="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id}>
            <div className="ic">RK</div>
            <div><b>{toast.title}</b><span>{toast.body}</span></div>
          </div>
        ))}
      </div>
    </>
  )
}
