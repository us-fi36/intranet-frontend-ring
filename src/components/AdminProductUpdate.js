import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Alert, Table, Form } from 'react-bootstrap';
import BackButton from './BackButton';

const AdminProductDetails = () => {
  const { state } = useLocation(); // Get the state passed from the ProductList component
  const { product } = state || {}; // Destructure the product data

  const navigate = useNavigate();

  // Initialize formData with default values
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    image: null,
    image_url: '', // For the current image URL
  });

  // New state for image preview
  const [imagePreview, setImagePreview] = useState('');

  // New state for showing the image file name and path
  const [imageFileName, setImageFileName] = useState('');

  // State for success and error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State for showing the confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update formData and imagePreview when product is available
  useEffect(() => {
    
    if (product) {
      setFormData({
        title: product.title || '',
        price: product.price || '',
        description: product.description || '',
        image_url: product.image_url || '',
        image: null,  // reset image to null
      });

      // Set initial imagePreview only if image_url exists
      if (product.image_url) {
        setImagePreview(`${process.env.REACT_APP_SERVER_URL}/${product.image_url}`);
        setImageFileName(product.image_url);  // Set the image file name if available
      } else {
        setImagePreview(''); // Set empty string if no image_url is present
        setImageFileName(''); // Reset file name
      }
    }
  }, [product, navigate]); // This effect runs when the product changes (or is available)

  // Early return if no product is found
  if (!product) {
    return <div className="text-center"><Alert variant="danger">Produkt nicht gefunden.</Alert></div>;
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        image: file,
      }));

      // Create a URL for the selected image and update the image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set the preview URL
      };
      reader.readAsDataURL(file);

      // Set the file name for the selected image
      setImageFileName(file.name);
    }
  };

  // Handle save or update product details
  const handleSave = async () => {
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('price', formData.price);
    formDataToSubmit.append('description', formData.description);
    formDataToSubmit.append('image_url', formData.image_url);
    if (formData.image) {
      formDataToSubmit.append('image', formData.image);
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/admin/update/${product.product_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSubmit,  // Body contains FormData
      });

      if (response.ok) {
        setSuccessMessage('Produkt erfolgreich aktualisiert!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      } else {
        setErrorMessage('Fehler beim Aktualisieren des Produkts');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setErrorMessage('Ein Fehler ist aufgetreten.');
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/admin/delete/${product.product_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', // Send as JSON
        },
        body: JSON.stringify({
          image_url: formData.image_url, // Send image_url with the request body
        }),
      });
  
      if (response.ok) {
        setSuccessMessage('Produkt erfolgreich gelöscht!');
        setTimeout(() => {
          navigate('/admin/products'); // Navigate back to the product list
        }, 2000);
      } else {
        setErrorMessage('Fehler beim Löschen des Produkts');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setErrorMessage('Ein Fehler ist aufgetreten.');
    }
  };

  // Function to confirm deletion
  const confirmDelete = () => {
    setShowDeleteConfirm(true); // Show confirmation dialog
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false); // Hide confirmation dialog
  };

  return (
    <div className="container mt-4">
      <h1>Produkt editieren: #{product.product_id}, {product.title}</h1>
      <Card className="product-details-card shadow-sm">
        <Card.Body>
          {/* Displaying success and error messages */}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form>
            {/* Table for Editable Fields */}
            <Table striped bordered className="mb-3">
              <tbody>
                {/* Image Row */}
                <tr>
                  <td><
                    strong>Bild</strong>
                    <p>{imageFileName}</p>
                  </td>
                  <td>
                    {/* Show current image or new preview */}
                    {imagePreview && (
                      <div className="mb-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxWidth: '200px', marginBottom: '10px' }}
                        />
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    
                  </td>
                </tr>

                {/* Title */}
                <tr>
                  <td><strong>Titel</strong></td>
                  <td>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </td>
                </tr>

                {/* Price */}
                <tr>
                  <td><strong>Preis (€)</strong></td>
                  <td>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </td>
                </tr>

                {/* Description */}
                <tr>
                  <td>
                    <strong>Beschreibung</strong>
                  </td>
                  <td>
                    <Form.Control
                      as="textarea"
                      rows={25}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                    <small className="text-muted">
                      Format für Tabellen-Output mit 2 Spalten <code>Key: Value</code> Delimiter <code>|</code>
                    </small>
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* Save Button */}
            <Card
              className="add-to-card shadow-sm mb-3"
              onClick={handleSave}
              style={{ cursor: 'pointer', padding: '15px' }}
            >
              Speichern
            </Card>

            {/* Delete Button */}
            <Card
              className="remove-from-cart-card shadow-sm mb-3"
              onClick={confirmDelete}
              style={{ cursor: 'pointer', padding: '15px', backgroundColor: '#f8d7da' }}
            >
              Produkt löschen
            </Card>

            {/* Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="confirmation-dialog">
                <p>Sind Sie sicher, dass Sie dieses Produkt löschen möchten?</p>
                <button onClick={handleDelete}>Ja, löschen</button>
                <button onClick={cancelDelete}>Abbrechen</button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      <BackButton />
    </div>
  );
};

export default AdminProductDetails;
