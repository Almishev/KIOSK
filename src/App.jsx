import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { fetchCategories, fetchItems, sendKitchenOrder } from "./api";

function formatPrice(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "0.00 €";
  return `${amount.toFixed(2)} €`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("bg-BG", {
    timeZone: "Europe/Sofia",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function App() {
  const [view, setView] = useState("home");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [ticket, setTicket] = useState(null);
  const barcodeRef = useRef(null);

  const visibleItems = items.filter((item) => item.category === category);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  async function openMenu() {
    setView("menu");
    setLoading(true);
    setError("");
    try {
      const [nextCategories, nextItems] = await Promise.all([
        fetchCategories(),
        fetchItems(),
      ]);
      setCategories(nextCategories);
      setItems(nextItems);
      setCategory((current) => current || nextCategories[0]?.name || "");
    } catch {
      setError("Менюто не се зареди. Провери дали Restaurant POS работи.");
    } finally {
      setLoading(false);
    }
  }

  function selectCategory(name) {
    setCategory(name);
    if (window.matchMedia("(min-width: 801px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function addItem(item) {
    setCart((current) => {
      const index = current.findIndex((line) => line._id === item._id);
      if (index === -1) {
        return [...current, { ...item, quantity: 1 }];
      }
      return current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, quantity: line.quantity + 1 } : line
      );
    });
  }

  function removeLine(index) {
    setCart((current) => current.filter((_, lineIndex) => lineIndex !== index));
  }

  function changeQuantity(index, delta) {
    setCart((current) =>
      current.flatMap((line, lineIndex) => {
        if (lineIndex !== index) return [line];
        const quantity = line.quantity + delta;
        return quantity > 0 ? [{ ...line, quantity }] : [];
      })
    );
  }

  useEffect(() => {
    if (view !== "done" || !ticket?.orderNumber || !barcodeRef.current) return;
    JsBarcode(barcodeRef.current, String(ticket.orderNumber), {
      format: "CODE128",
      displayValue: true,
      fontSize: 18,
      height: 70,
      margin: 0,
    });
  }, [view, ticket]);

  async function placeOrder() {
    setSending(true);
    setError("");
    const ordered = cart.map((line) => ({
      _id: line._id,
      name: line.name,
      price: line.price,
      quantity: line.quantity,
      department: line.department,
    }));
    try {
      const result = await sendKitchenOrder(ordered);
      setTicket({
        orderNumber: result.orderNumber,
        createdAt: result.createdAt,
        items: ordered,
      });
      setCart([]);
      setView("done");
    } catch {
      setError("Поръчката не се изпрати. Опитай отново.");
    } finally {
      setSending(false);
    }
  }

  function restart() {
    setError("");
    setTicket(null);
    setView("home");
  }

  return (
    <div className="app">
      {view !== "home" && view !== "done" && (
        <header className="topbar">
          <div className="brand">Киоск</div>
          <div className="actions">
            {view === "cart" ? (
              <button className="btn btn-ghost" onClick={() => setView("menu")}>
                Меню
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={restart}>
                Начало
              </button>
            )}
            <button className="btn btn-accent" onClick={() => setView("cart")}>
              Количка ({count})
            </button>
          </div>
        </header>
      )}

      {view === "home" && (
        <main className="home">
          <h1>Поръчай</h1>
          <p>Избери от менюто и изпрати към кухнята.</p>
          <button className="btn btn-primary" onClick={openMenu}>
            Започни
          </button>
        </main>
      )}

      {view === "menu" && (
        <main className="screen">
          {error && <div className="banner">{error}</div>}
          {loading && <p className="empty">Зареждане на менюто...</p>}
          {!loading && !error && (
            <div className="menu">
              <div className="categories">
                {categories.map((entry) => (
                  <button
                    key={entry._id}
                    className={entry.name === category ? "category active" : "category"}
                    onClick={() => selectCategory(entry.name)}
                  >
                    {entry.name}
                  </button>
                ))}
              </div>
              <div className="items">
                {visibleItems.map((item) => (
                  <button key={item._id} className="item" onClick={() => addItem(item)}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{formatPrice(item.price)}</span>
                  </button>
                ))}
                {visibleItems.length === 0 && (
                  <p className="empty">Няма артикули в тази категория.</p>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {view === "cart" && (
        <main className="screen">
          {error && <div className="banner">{error}</div>}
          <div className="cart">
            {cart.length === 0 && <p className="empty">Количката е празна.</p>}
            {cart.map((line, index) => (
              <article className="line" key={`${line._id}-${index}`}>
                <div>
                  <h2>{line.name}</h2>
                  <div>{formatPrice(line.price)}</div>
                </div>
                <div className="qty">
                  <button className="btn btn-ghost" onClick={() => changeQuantity(index, -1)}>
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button className="btn btn-ghost" onClick={() => changeQuantity(index, 1)}>
                    +
                  </button>
                  <button className="btn btn-danger btn-remove" onClick={() => removeLine(index)}>
                    X
                  </button>
                </div>
              </article>
            ))}
            <div className="total">
              <span>Общо</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button
              className="btn btn-primary"
              disabled={cart.length === 0 || sending}
              onClick={placeOrder}
            >
              {sending ? "Изпращане..." : "Поръчай"}
            </button>
          </div>
        </main>
      )}

      {view === "done" && (
        <main className="done">
          <div className="slip">
            <p className="slip-title">Киоск</p>
            <p className="slip-number">{ticket?.orderNumber}</p>
            <p className="slip-time">{ticket?.createdAt ? formatDateTime(ticket.createdAt) : ""}</p>
            <ul className="slip-items">
              {(ticket?.items || []).map((line) => (
                <li key={line._id}>
                  <span>{line.name}</span>
                  <span>× {line.quantity}</span>
                </li>
              ))}
            </ul>
            <svg ref={barcodeRef} />
          </div>
          <div className="no-print actions">
            <button className="btn btn-primary" onClick={() => window.print()}>
              Принтирай
            </button>
            <button className="btn btn-ghost" onClick={restart}>
              Нова поръчка
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
