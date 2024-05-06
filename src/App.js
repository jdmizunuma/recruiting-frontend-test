import React, { useState, useEffect } from "react";

function CreditNotes({ key, id, organization_id, getUSD, getEUR, currency, value }) {
  const [usd, setUsd] = useState(0);
  const [eur, setEur] = useState(0);

  useEffect(() => {
    const usdValue = getUSD(currency, value);
    const eurValue = getEUR(currency, value);
    setUsd(usdValue);
    setEur(eurValue);
  }, [currency, value, getUSD, getEUR]);

return(
  <div className="item border-2 border-gray-300 flex items-center justify-between rounded-lg p-4">
      <div className="flex items-center">
        <input
          type="radio"


          className="mr-3 rounded-full h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        />
        <span>
          inv_{key} (<span className="gray-text">{organization_id}</span>)
        </span>
      </div>
      <span className="flex-1 text-center">€{eur.toFixed(2)} EUR (${usd.toFixed(2)} USD)</span>
      <span>{id}</span>
    </div>
)
}

function Invoice({ id, organization_id, index, value, currency, state, isSelected, onSelect, getUSD, getEUR }) {
  const [usd, setUsd] = useState(0);
  const [eur, setEur] = useState(0);

  useEffect(() => {
    const usdValue = getUSD(currency, value);
    const eurValue = getEUR(currency, value);
    setUsd(usdValue);
    setEur(eurValue);
  }, [currency, value, getUSD, getEUR]);

  const handleSelectChange = () => {
    onSelect(id); // Notificar al componente padre sobre la factura seleccionada
    // Aquí puedes realizar la llamada a la API filtrada por la factura seleccionada (id)
    fetch(`https://recruiting.api.bemmbo.com/invoices/pending?type=credit_note&reference=${id}`, {
      method: "GET"
    })
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter((item) => item.type === "credit_note" && item.reference === `${id}`);
        // Manejar la respuesta de la API según tus necesidades
        // Puedes guardar la información en el estado o pasarlo como prop a CreditNotes
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="item border-2 border-gray-300 flex items-center justify-between rounded-lg p-4">
      <div className="flex items-center">
        <input
          type="radio"
          checked={isSelected}
          onChange={handleSelectChange}
          className="mr-3 rounded-full h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        />
        <span>
          inv_{index} (<span className="gray-text">{organization_id}</span>)
        </span>
      </div>
      <span className="flex-1 text-center">€{eur.toFixed(2)} EUR (${usd.toFixed(2)} USD)</span>
      <span>{state}</span>
    </div>
  );
}

function App() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [creditNoteInfo, setCreditNoteInfo] = useState([]);
  const [usdToClp, setUsdToClp] = useState(null);
  const [usdToEur, setUsdToEur] = useState(null);

  // Función para obtener valor en USD según la moneda
  const getUSD = (currency, value) => {
    if (currency === "CLP") {
      return value / usdToClp;
    } else {
      return value;
    }
  };

  // Función para obtener valor en EUR según la moneda
  const getEUR = (currency, value) => {
    if (currency === "CLP") {
      return getUSD(currency, value) * usdToEur;
    } else {
      return value * usdToEur;
    }
  };

  useEffect(() => {
    fetch("https://recruiting.api.bemmbo.com/invoices/pending?type=received", {
      method: "GET"
    })
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter((item) => item.type === "received");
        setInvoices(filteredData);
      })
      .catch((error) => console.log(error));

    // Realizar la llamada a la API de currency exchange
    fetch('https://api.currencyapi.com/v3/latest?apikey=cur_live_kjJAs3zdUtDN6dfXxhY5JJHWGY58PZRv33DR5EtE&currencies=EUR%2CCLP')
      .then(response => response.json())
      .then(data => {
        const exchangeRateUSD_CLP = data.data['CLP'].value;
        const exchangeRateUSD_EUR = data.data['EUR'].value;
        setUsdToClp(exchangeRateUSD_CLP);
        setUsdToEur(exchangeRateUSD_EUR);
      })
      .catch(error => console.error('Error al obtener el tipo de cambio:', error));
  }, []);

  const handleInvoiceSelect = (selectedId) => {
    setSelectedInvoiceId(selectedId); // Actualizar ID de la factura seleccionada
  };

  return (
    <div className="app">
      <div className="container mx-auto py-4">
        <h2 className="text-center text-2xl font-bold mb-4">Selecciona una factura</h2>
        <div className="grid grid-cols-1 gap-4">
          {invoices.map((invoice, index) => (
            <Invoice
              key={index}
              id={invoice.id}
              organization_id={invoice.organization_id}
              index={index + 1}
              value={invoice.amount}
              currency={invoice.currency}
              state={invoice.type}
              isSelected={selectedInvoiceId === invoice.id}
              onSelect={handleInvoiceSelect}
              getUSD={getUSD}
              getEUR={getEUR}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
