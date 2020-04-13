import React, { useState, useEffect } from 'react';
import { MdMoreHoriz } from 'react-icons/md';
import { toast } from 'react-toastify';

import ActionMenu from '~/components/ActionMenu';
import ListHeader from '~/components/ListHeader';
import Pagination from '~/components/Pagination';

import api from '~/services/api';

import NoImage from '~/assets/noImage.png';

import {
  Container,
  Content,
  DeliverymenTable,
  DeliverymanTableData,
} from './styles';

export default function DeliverymenList() {
  const [selectedDeliveryman, setSelectedDeliveryman] = useState(-1);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(-1);
  const [data, setData] = useState([]);

  async function loadDeliverymen(name = '', pageNumber = 1) {
    try {
      const response = await api.get('deliveryman', {
        params: {
          name,
          page: pageNumber,
        },
      });
      setData(response.data.deliverymen);
      setMaxPage(response.data.maxPage);
      return true;
    } catch (error) {
      toast.error('Falha ao carregar entregadores(as)!');
      return false;
    }
  }

  useEffect(() => {
    async function loadInitialDeliverymen() {
      try {
        const response = await api.get('deliveryman');
        setData(response.data.deliverymen);
        setMaxPage(response.data.maxPage);
      } catch (error) {
        toast.error('Falha ao carregar entregadores(as)!');
      }
    }

    loadInitialDeliverymen();
  }, []);

  async function handleChangePage(pageNumber) {
    const loaded = loadDeliverymen('', pageNumber);
    if (loaded) setPage(pageNumber);
  }

  async function handleDeleteDeliveryman() {
    try {
      await api.delete(`deliveryman/${data[selectedDeliveryman].id}`);
      setSelectedDeliveryman(-1);
      loadDeliverymen();
      toast.success('Entregador(a) removido(a)!');
    } catch (error) {
      toast.error('Falha na remoção do(a) entregador(a)!');
      console.tron.log(error);
    }
  }

  const handleInputSearch = event => {
    const loaded = loadDeliverymen(event.target.value);
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
            <span>Não foram encontrados(as) entregadores(as)</span>
          ) : (
            <DeliverymenTable>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map((deliveryman, index) => (
                  <tr key={deliveryman.id}>
                    <td>#{deliveryman.id}</td>
                    <DeliverymanTableData>
                      {deliveryman.avatar ? (
                        <img
                          src={deliveryman.avatar.url}
                          alt={deliveryman.name}
                        />
                      ) : (
                        <img src={NoImage} alt={deliveryman.name} />
                      )}
                    </DeliverymanTableData>
                    <td>{deliveryman.name}</td>
                    <td>{deliveryman.email}</td>
                    <td>
                      <MdMoreHoriz
                        size={32}
                        onClick={() =>
                          setSelectedDeliveryman(
                            selectedDeliveryman === index ? -1 : index
                          )
                        }
                      />
                      {selectedDeliveryman === index && (
                        <ActionMenu
                          route="deliveryman"
                          object={data[selectedDeliveryman]}
                          onRemoveClick={handleDeleteDeliveryman}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </DeliverymenTable>
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
