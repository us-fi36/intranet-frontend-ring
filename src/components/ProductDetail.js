import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Alert, Table } from 'react-bootstrap';
import { useCart } from './CartContext';

import BackButton from './BackButton';

const ProductDetail = () => {
  const { state } = useLocation(); // Get the state passed from the ProductList component
  const { product } = state || {}; // Destructure the product data
  const { handleAddToCart } = useCart();

  if (!product) {
    return <div className="text-center"><Alert variant="danger">Produkt nicht gefunden.</Alert></div>;
  }

  // Split the description string by | and remove any trailing spaces
  const details = product.description ? product.description.split('|').map(detail => detail.trim()) : [];

  // Convert the details array into key-value pairs
  const detailsKeyValue = details.map((detail) => {
    const [key, value] = detail.split(':').map(item => item.trim());
    return { key, value };
  });

  return (
    <div className="container mt-4">
      <Card className="product-details-card shadow-sm">
        <Card.Body>
          <Card.Img
            variant="top"
            src={`https://fi.mshome.net:3001/${product.image_url || '/static/images/default-product.jpg'}`}
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          />
          <div className="mt-3">
            <Card.Title>{product.title}</Card.Title>
            
            <Card.Text><strong>{product.price} €</strong></Card.Text>

            
            <div className="mt-3">
              {/* Displaying details in a table format */}
              <Table striped bordered>
                <tbody>
                  {detailsKeyValue.map((detail, index) => (
                    <tr key={index}>
                      <td><strong>{detail.key}</strong></td>
                      <td>{detail.value}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card
         className="add-to-cart-card shadow-sm"
         style={{ cursor: 'pointer', flex: '0 0 30%' }}
         onClick={() => handleAddToCart(product.product_id, product.price, product.title, product.description, product.image_url)}
      >
        <Card.Body className="d-flex justify-content-center align-items-center">
            <span className="text-muted d-block">In den Warenkorb</span>
        </Card.Body>
      </Card>
      <BackButton />
                  
    </div>
  );
};

export default ProductDetail;
