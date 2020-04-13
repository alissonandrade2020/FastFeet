import React, { useState, useEffect } from 'react';
import { MdMoreHoriz } from 'react-icons/md';
import { toast } from 'react-toastify';

import ListHeader from '~/components/ListHeader';
import ActionMenu from '~/components/ActionMenu';
import Pagination from '~/components/Pagination';

import api from '~/services/api';

import { Container, Content, RecipientsTable } from './styles';

export default function RecipientsList() {
  const [selectedRecipient, setSelectedRecipient] = useState(-1);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(-1);
  const [data, setData] = useState([]);

  async function loadRecipients(name = '', pageNumber = 1) {
    try {
      const response = await api.get('recipients', {
        params: {
          name,
          page: pageNumber,
        },
      });
      setData(response.data.recipients);
      setMaxPage(response.data.maxPage);
      return true;
    } catch (error) {
      toast.error('Falha ao carregar destinatários!');
      return false;
    }
  }

  useEffect(() => {
    loadRecipients();
  }, []);

  async function handleChangePage(pageNumber) {
    const loaded = loadRecipients('', pageNumber);
    if (loaded) setPage(pageNumber);
  }

  async function handleDeleteRecipient() {
    try {
      await api.delete(`recipients/${data[selectedRecipient].id}`);
      setSelectedRecipient(-1);
      loadRecipients();
      toast.success('Destinatário removido!');
    } catch (error) {
      toast.error('Falha na remoção de destinatário!');
      console.tron.log(error);
    }
  }

  const handleInputSearch = event => {
    const loaded = loadRecipients(event.target.value);
    if (loaded) setPage(1);
  };

  return (
    <Container>
      <Content>
        <ListHeader
          title="Gerenciando Entregadores"
          registerRoute="/deliveryman/register"
          searchInputPlaceholder="Buscar por entregadores"
          searchFunction={handleInputSearch}
        />
        <div>
          {data.length === 0 ? (
            <span>Não foram encontrados destinatários</span>
          ) : (
            <RecipientsTable>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Endereço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map((recipient, index) => (
                  <tr key={recipient.id}>
                    <td>#{recipient.id}</td>
                    <td>{recipient.name}</td>
                    <td>
                      {`${recipient.street}, ${recipient.number}, ${recipient.city} - ${recipient.state}`}
                    </td>
                    <td>
                      <MdMoreHoriz
                        size={32}
                        onClick={() =>
                          setSelectedRecipient(
                            selectedRecipient === index ? -1 : index
                          )
                        }
                      />
                      {selectedRecipient === index && (
                        <ActionMenu
                          route="recipient"
                          object={data[selectedRecipient]}
                          onRemoveClick={handleDeleteRecipient}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </RecipientsTable>
          )}
        </div>
        {maxPage > 1 && (
          <Pagination
            maxPage={maxPage}
            page={page}
            handleChangePage={handleChangePage}
          />
        )}
      </Content>
    </Container>
  );
}
