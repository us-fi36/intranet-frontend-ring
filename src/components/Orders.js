import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/orders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (response.ok) {
          setOrders(data);
        } else {
          setError('Fehler beim Laden der Bestellungen.');
        }
      } catch (err) {
        setError('Ein Fehler ist aufgetreten.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCardClick = (product) => {
    navigate(`/products/${product.product_id}`, { state: { product } });
  };

  if (loading) {
    return <div className="text-center"><Spinner animation="border" variant="primary" /></div>;
  }

  if (error) {
    return <div className="text-center"><Alert variant="danger">{error}</Alert></div>;
  }

  return (
    <div className="container mt-4">
      <h2>Bestellungen für {userEmail}</h2>
      {orders.length === 0 ? (
        <div className="text-center w-100">
          <Alert variant="warning">Keine Bestellungen gefunden.</Alert>
        </div>
      ) : (
        orders.map((order) => (
          <Card className="mb-4 shadow-sm" key={order.order_id}>
            <Card.Body>
              <Card.Title>
                Bestellung vom: {new Date(order.order_date).toLocaleString('de-DE', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Card.Title>
              <hr />
              <div className="order-items">
                {order.items.map((item) => (
                  <div className="mb-2" key={item.product_id}>
                    {/* Description Card */}
                    <Card className="product-description-card shadow-sm mb-2" onClick={() => handleCardClick(item)}>
                      <Card.Body>
                        <Card.Title>{item.quantity}x {item.title}: {item.price}€</Card.Title>
                        <Card.Text>
                          {item.description.length > 100
                            ? item.description.substring(0, 100) + '...'
                            : item.description}
                            
                        </Card.Text>
                      </Card.Body>
                    </Card>

                    
                  </div>
                ))}
              </div>
              <hr />
              <div className="total-amount">
                <h5>
                  Gesamtbetrag: {order.total_amount}€
                </h5>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default Orders;
