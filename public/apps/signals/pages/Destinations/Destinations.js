import React, { Component } from 'react';
import { connect as connectRedux } from 'react-redux';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiIcon
} from '@elastic/eui';
import {
  LEFT_ALIGNMENT,
} from '@elastic/eui/lib/services';
import { cloneDeep, get } from 'lodash';
import { DestinationsService } from '../../services';
import { addSuccessToast, addErrorToast } from '../../redux/actions';
import {
  ContentPanel,
  TableDeleteAction,
  TableCloneAction,
  TableMultiDeleteButton,
  TableIdCell,
  TableTextCell,
  PopoverButton
} from '../../components';
import {
  deleteText,
  cloneText,
  saveText,
  typeText,
} from '../../utils/i18n/common';
import {
  destinationsText
} from '../../utils/i18n/destination';
import {
  TABLE_SORT_FIELD,
  TABLE_SORT_DIRECTION,
  DESTINATION_TYPE
} from './utils/constants';
import { APP_PATH } from '../../utils/constants';

class Destinations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      isLoading: true,
      destinations: [],
      tableSelection: [],
      isAddDestinationPopoverOpen: false
    };

    this.destService = new DestinationsService(this.props.httpClient);
  }

  componentDidMount() {
    this.getDestinations();
  }

  putDestination = async ({ _id, ...destination }) => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      await this.destService.put(destination, _id);
      dispatch(addSuccessToast((<p>{saveText} {_id}</p>)));
      this.getDestinations();
    } catch (error) {
      console.error('Destinations -- putDestinations', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
      console.debug('Destinations -- destination', destination);
    }
    this.setState({ isLoading: false });
  }

  getDestinations = async () => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      const { resp: destinations } = await this.destService.get();
      this.setState({ destinations });
    } catch (error) {
      console.error('Destinations -- getDestinations', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
    }
    this.setState({ isLoading: false });
  }

  handleCloneDestination = async destination => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      const { _id: id, ...rest } = destination;
      await this.destService.put(cloneDeep({ ...rest }), `${id}_copy`);
      dispatch(addSuccessToast((<p>{cloneText} {id}</p>)));
      this.getDestinations();
    } catch (error) {
      console.error('Destinations -- cloneDestinations', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
      console.debug('Destiantions -- destination', destination);
    }
    this.setState({ isLoading: false });
  }

  deleteDestinations = async (destinationIds = []) => {
    const { dispatch } = this.props;
    const promises = [];

    this.setState({ isLoading: true, error: null });
    destinationIds.forEach(id => {
      const promise = this.destService.delete(id)
        .then(() => {
          dispatch(addSuccessToast((<p>{deleteText} {id}</p>)));
        })
        .catch(error => {
          console.error('Destinations -- deleteDestinations', error);
          dispatch(addErrorToast(error));
          this.setState({ error });
          console.debug('Destinations -- destinationsIds', destinationIds);
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    this.setState({ isLoading: false });
    this.getDestinations();
  }

  handleDeleteDestinations = (destinations = []) => {
    const { onTriggerConfirmDeletionModal } = this.props;
    onTriggerConfirmDeletionModal({
      body: destinations.join(', '),
      onConfirm: () => {
        this.deleteDestinations(destinations);
        onTriggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        onTriggerConfirmDeletionModal(null);
      }
    });
  }

  triggerAddDestinationPopover = () => {
    this.setState(prevState => ({
      isAddDestinationPopoverOpen: !prevState.isAddDestinationPopoverOpen
    }));
  }

  addDestination = destinationType => {
    this.triggerAddDestinationPopover();
    this.props.history.push(`${APP_PATH.DEFINE_DESTINATION}?destinationType=${destinationType}`);
  }

  renderToolsLeft = () => {
    const { tableSelection, isLoading } = this.state;
    if (tableSelection.length === 0) return null;

    const handleMultiDelete = () => {
      this.handleDeleteDestinations(tableSelection.map(item => item._id));
      this.setState({ tableSelection: [] });
    };

    return (
      <TableMultiDeleteButton
        onClick={handleMultiDelete}
        numOfSelections={tableSelection.length}
        isLoading={isLoading}
      />
    );
  }

  render() {
    const { history } = this.props;

    const {
      destinations,
      isLoading,
      error,
      isAddDestinationPopoverOpen
    } = this.state;

    const actions = [
      {
        render: destination => (
          <TableCloneAction
            name={destination._id}
            onClick={() => this.handleCloneDestination(destination)}
          />
        )
      },
      {
        render: ({ _id }) => (
          <TableDeleteAction
            name={_id}
            onClick={() => this.handleDeleteDestinations([_id])}
          />
        )
      }
    ];

    const columns = [
      {
        field: '_id',
        name: 'Id',
        footer: 'Id',
        alignment: LEFT_ALIGNMENT,
        truncateText: true,
        sortable: true,
        render: (id, { type }) => (
          <TableIdCell
            name={id}
            value={id}
            onClick={() => {
              history.push(`${APP_PATH.DEFINE_DESTINATION}?id=${id}&destinationType=${type}`);
            }}
          />
        )
      },
      {
        field: 'type',
        name: typeText,
        footer: typeText,
        render: (type, { _id }) => (
          <TableTextCell
            value={type}
            name={`Type-${_id}`}
          />
        )
      },
      {
        actions
      }
    ];

    const search = {
      toolsLeft: this.renderToolsLeft(),
      box: {
        incremental: true,
      }
    };

    const selection = {
      selectable: (doc) => doc._id,
      onSelectionChange: (tableSelection) => this.setState({ tableSelection })
    };

    const sorting = {
      sort: {
        field: TABLE_SORT_FIELD,
        direction: TABLE_SORT_DIRECTION
      }
    };

    const addDestinationContextMenuPanels = [
      {
        id: 0,
        title: 'Destinations',
        items: [
          {
            name: 'Email',
            icon: (<EuiIcon type="logoGmail" size="m" />),
            onClick: () => this.addDestination(DESTINATION_TYPE.EMAIL)
          },
          {
            name: 'Slack',
            icon: (<EuiIcon type="logoSlack" size="m" />),
            onClick: () => this.addDestination(DESTINATION_TYPE.SLACK)
          },
          {
            name: 'PagerDuty (comming soon)',
            icon: (<EuiIcon type="empty" size="m" />),
            onClick: () => null
          }
        ]
      }
    ];

    return (
      <ContentPanel
        title={destinationsText}
        actions={[
          (
            <PopoverButton
              isPopoverOpen={isAddDestinationPopoverOpen}
              contextMenuPanels={addDestinationContextMenuPanels}
              onClick={this.triggerAddDestinationPopover}
              name="AddDestination"
            />
          )
        ]}
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiInMemoryTable
              error={get(error, 'message')}
              items={destinations}
              itemId="_id"
              columns={columns}
              search={search}
              selection={selection}
              sorting={sorting}
              loading={isLoading}
              isSelectable
              pagination
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentPanel>
    );
  }
}

Destinations.propTypes = {
  httpClient: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default connectRedux()(Destinations);
