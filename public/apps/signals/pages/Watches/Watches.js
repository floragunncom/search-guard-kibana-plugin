import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable
} from '@elastic/eui';
import { cloneDeep, get } from 'lodash';
import PropTypes from 'prop-types';
import {
  LEFT_ALIGNMENT,
} from '@elastic/eui/lib/services';
import { WatchService } from '../../services';
import {
  ContentPanel,
  TableDeleteAction,
  TableCloneAction,
  TableInspectAction,
  TableMultiDeleteButton,
  TableIdCell,
  TableTextCell,
  HelpButton,
  CreateButton
} from '../../components';
import { addSuccessToast, addErrorToast } from '../../redux/actions';
import {
  noText,
  yesText,
  deleteText,
  cloneText,
  saveText,
  addText
} from '../../utils/i18n/common';
import {
  numOfChecksText,
  numOfActionsText,
  isActiveText
} from '../../utils/i18n/watch';
import { APP_PATH, FLYOUTS } from '../../utils/constants';
import { TABLE_SORT_FIELD, TABLE_SORT_DIRECTION } from './utils/constants';

class Watches extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      isLoading: true,
      watches: [],
      tableSelection: []
    };

    this.watchService = new WatchService(this.props.httpClient);
  }

  componentDidMount() {
    this.getWatches();
  }

  componentWillUnmount = () => {
    this.props.onTriggerFlyout(null);
  }

  putWatch = async ({ _id, ...watch }) => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      await this.watchService.put(watch, _id);
      dispatch(addSuccessToast((<p>{saveText} {_id}</p>)));
      this.getWatches();
    } catch (error) {
      console.error('Watches -- putWatches', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
      console.debug('Watches -- watch', watch);
    }
    this.setState({ isLoading: false });
  }

  getWatches = async () => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      const { resp: watches } = await this.watchService.get();
      this.setState({ watches });
    } catch (error) {
      console.error('Watches -- getWatches', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
    }
    this.setState({ isLoading: false });
  }

  handleCloneWatch = async watch => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      const { _id: id, ...rest } = watch;
      await this.watchService.put(cloneDeep({ ...rest }), `${id}_copy`);
      dispatch(addSuccessToast((<p>{cloneText} {id}</p>)));
      this.getWatches();
    } catch (error) {
      console.error('Watches -- cloneWatches', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
      console.debug('Watches -- watch', watch);
    }
    this.setState({ isLoading: false });
  }

  deleteWatches = async (watchIds = []) => {
    const { dispatch } = this.props;
    const promises = [];

    this.setState({ isLoading: true, error: null });
    watchIds.forEach(id => {
      const promise = this.watchService.delete(id)
        .then(() => {
          dispatch(addSuccessToast((<p>{deleteText} {id}</p>)));
        })
        .catch(error => {
          console.error('Watches -- deleteWatches', error);
          dispatch(addErrorToast(error));
          this.setState({ error });
          console.debug('Watches -- watchIds', watchIds);
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    this.setState({ isLoading: false });
    this.getWatches();
  }

  handleDeleteWatches = (watches = []) => {
    const { onTriggerConfirmDeletionModal } = this.props;
    onTriggerConfirmDeletionModal({
      body: watches.join(', '),
      onConfirm: () => {
        this.deleteWatches(watches);
        onTriggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        onTriggerConfirmDeletionModal(null);
      }
    });
  }

  renderToolsLeft = () => {
    const { tableSelection, isLoading } = this.state;
    if (tableSelection.length === 0) return null;

    const handleMultiDelete = () => {
      this.handleDeleteWatches(tableSelection.map(item => item._id));
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
    const { history, onTriggerFlyout } = this.props;
    const { watches, isLoading, error } = this.state;

    const actions = [
      {
        render: watch => (
          <TableCloneAction
            name={watch._id}
            onClick={() => this.handleCloneWatch(watch)}
          />
        )
      },
      {
        render: ({ _id }) => (
          <TableDeleteAction
            name={_id}
            onClick={() => this.handleDeleteWatches([_id])}
          />
        )
      }
    ];

    const columns = [
      {
        width: '5%',
        alignment: LEFT_ALIGNMENT,
        render: ({ _id }) => (
          <TableInspectAction
            name={_id}
            onClick={() => history.push(`${APP_PATH.ALERTS}?watchId=${_id}`)}
          />
        )
      },
      {
        field: '_id',
        name: 'Id',
        footer: 'Id',
        alignment: LEFT_ALIGNMENT,
        truncateText: true,
        sortable: true,
        render: watchId => (
          <TableIdCell
            name={watchId}
            value={watchId}
            onClick={() => history.push(`${APP_PATH.DEFINE_WATCH}?id=${watchId}`)}
          />
        )
      },
      {
        field: 'active',
        name: isActiveText,
        footer: isActiveText,
        render: (active, { _id }) => (
          <TableTextCell
            value={active ? yesText : noText}
            name={`Active-${_id}`}
          />
        )
      },
      {
        field: 'checks',
        name: numOfChecksText,
        footer: numOfChecksText,
        render: (checks = [], { _id }) => (
          <TableTextCell
            value={checks.length}
            name={`NumOfChecks-${_id}`}
          />
        )
      },
      {
        field: 'actions',
        name: numOfActionsText,
        footer: numOfActionsText,
        render: (actions = [], { _id }) => (
          <TableTextCell
            key="numOfActions"
            value={actions.length}
            name={`NumOfActions-${_id}`}
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

    return (
      <ContentPanel
        title="Watches"
        actions={[
          (
            <HelpButton
              onClick={() => {
                onTriggerFlyout({
                  type: FLYOUTS.WATCHES_HELP,
                  payload: { onPutWatch: this.putWatch, error, isLoading }
                });
              }}
            />
          ),
          (
            <CreateButton
              value={addText}
              onClick={() => history.push(APP_PATH.DEFINE_WATCH)}
            />
          )
        ]}
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiInMemoryTable
              error={get(error, 'message')}
              items={watches}
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

Watches.propTypes = {
  httpClient: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  onTriggerFlyout: PropTypes.func.isRequired,
};

export default connect()(Watches);
