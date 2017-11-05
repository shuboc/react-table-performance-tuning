import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from './index.styl';
import TableRow from './TableRow';

const ROW_HEIGHT = 37;
const ROW_NUM_IN_VIEW = 10;

class TableBody extends PureComponent {
    static propTypes = {
        columns: PropTypes.array,
        currentHoverKey: PropTypes.any,
        expandedRowKeys: PropTypes.array,
        expandedRowRender: PropTypes.func,
        emptyText: PropTypes.func,
        onMouseOver: PropTypes.func,
        onTouchStart: PropTypes.func,
        onScroll: PropTypes.func,
        onRowHover: PropTypes.func,
        onRowClick: PropTypes.func,
        records: PropTypes.array,
        rowClassName: PropTypes.func,
        rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        scrollTop: PropTypes.number
    };

    static defaultProps = {
        emptyText: () => {
            return 'No Data';
        },
        onMouseOver: () => {},
        onTouchStart: () => {},
        onScroll: () => {},
        records: [],
        rowKey: 'key'
    };

    state = {
        firstIndexInView: 0
    };

    actions = {
        handleBodyScroll: (e) => {
            const { onScroll } = this.props;

            // TODO: this may cause perf issue (recalculate style)
            const scrollTop = e.target.scrollTop;
            const firstIndexInView = Math.floor(scrollTop / ROW_HEIGHT);

            // console.log('scrollTop:', scrollTop);
            // console.log('firstIndexInView:', firstIndexInView);

            this.setState({
                firstIndexInView
            });

            onScroll(e);
        }
    };

    componentDidMount() {
        const { onMouseOver, onTouchStart } = this.props;
        this.body.addEventListener('scroll', this.actions.handleBodyScroll);
        this.body.addEventListener('mouseover', onMouseOver);
        this.body.addEventListener('touchstart', onTouchStart);
    }
    componentWillUnmount() {
        const { onMouseOver, onTouchStart } = this.props;
        this.body.removeEventListener('scroll', this.actions.handleBodyScroll);
        this.body.removeEventListener('mouseover', onMouseOver);
        this.body.removeEventListener('touchstart', onTouchStart);
    }

    componentDidUpdate(prevProps, prevState) {
        // XXX: may cause recalculate layout
        // const { scrollTop } = this.props;
        // if (this.body.scrollTop !== scrollTop) {
        //     this.body.scrollTop = scrollTop;
        // }
    }

    getRowKey (record, index) {
        const rowKey = this.props.rowKey;
        let key = (typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey]);
        return key === undefined ? `table_row_${index}` : key;
    }

    render() {
        const {
            columns,
            currentHoverKey,
            expandedRowKeys,
            expandedRowRender,
            emptyText,
            onRowHover,
            onRowClick,
            records,
            rowClassName
        } = this.props;
        const { firstIndexInView } = this.state;
        const noData = (!records || records.length === 0);

        const topPlacehoderRowNum = firstIndexInView;
        const bottomPlaceholderRomNum = records.length - firstIndexInView - ROW_NUM_IN_VIEW;
        // console.log('topPlacehoderRowNum:', topPlacehoderRowNum);
        // console.log('bottomPlaceholderRomNum:', bottomPlaceholderRomNum);
        // console.log('total:', topPlacehoderRowNum + bottomPlaceholderRomNum + ROW_NUM_IN_VIEW);

        return (
            <div
                className={styles.tbody}
                ref={node => {
                    this.body = node;
                }}
            >
                {
                    firstIndexInView > 0 &&
                        <div style={{ height: topPlacehoderRowNum * ROW_HEIGHT + 'px' }}>Placeholder</div>
                }
                {
                    records.map((row, index) => {
                        const key = this.getRowKey(row, index);
                        return (
                            <TableRow
                                columns={columns}
                                currentHoverKey={currentHoverKey}
                                expandedRowKeys={expandedRowKeys}
                                expandedRowRender={expandedRowRender}
                                hoverKey={key}
                                index={index}
                                key={key}
                                onHover={onRowHover}
                                onRowClick={onRowClick}
                                record={row}
                                rowClassName={rowClassName}
                            />
                        );
                    })
                    .slice(firstIndexInView, firstIndexInView + ROW_NUM_IN_VIEW + 1)
                }
                {
                    bottomPlaceholderRomNum > 0 &&
                        <div style={{ height: bottomPlaceholderRomNum * ROW_HEIGHT + 'px' }}>Placeholder</div>
                }
                {
                    noData &&
                    <div className={styles.tablePlaceholder}>
                        { emptyText() }
                    </div>
                }
            </div>
        );
    }
}

export default TableBody;
