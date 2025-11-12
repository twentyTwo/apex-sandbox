import React, { useState, useEffect } from 'react';

function Leaderboard() {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/leaderboard?limit=100')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }
                return res.json();
            })
            .then(data => {
                setTopUsers(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="slds-spinner_container">
                <div role="status" className="slds-spinner slds-spinner_medium">
                    <span className="slds-assistive-text">Loading</span>
                    <div className="slds-spinner__dot-a"></div>
                    <div className="slds-spinner__dot-b"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="slds-notify slds-notify_alert slds-alert_error" role="alert">
                <span className="slds-assistive-text">error</span>
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        <div className="slds-p-around_medium">
            <div className="slds-page-header">
                <div className="slds-page-header__row">
                    <div className="slds-page-header__col-title">
                        <div className="slds-media">
                            <div className="slds-media__figure">
                                <span className="slds-icon_container slds-icon-standard-opportunity">
                                    <svg className="slds-icon slds-page-header__icon" aria-hidden="true">
                                        <use href="/assets/icons/standard-sprite/svg/symbols.svg#trophy"></use>
                                    </svg>
                                </span>
                            </div>
                            <div className="slds-media__body">
                                <div className="slds-page-header__name">
                                    <div className="slds-page-header__name-title">
                                        <h1>
                                            <span className="slds-page-header__title slds-truncate" title="Leaderboard">Leaderboard</span>
                                        </h1>
                                    </div>
                                </div>
                                <p className="slds-page-header__name-meta">Top {topUsers.length} Users by Points</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="slds-m-top_medium">
                {topUsers.length === 0 ? (
                    <div className="slds-text-align_center slds-p-around_large">
                        <p className="slds-text-body_regular">No users have earned points yet. Be the first!</p>
                    </div>
                ) : (
                    <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_striped">
                        <thead>
                            <tr className="slds-line-height_reset">
                                <th className="slds-text-align_center" scope="col" style={{width: '80px'}}>
                                    <div className="slds-truncate" title="Rank">Rank</div>
                                </th>
                                <th scope="col">
                                    <div className="slds-truncate" title="User">User</div>
                                </th>
                                <th className="slds-text-align_right" scope="col" style={{width: '150px'}}>
                                    <div className="slds-truncate" title="Points">Points</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {topUsers.map((user, index) => (
                                <tr key={index} className="slds-hint-parent">
                                    <td className="slds-text-align_center" data-label="Rank">
                                        <div className="slds-truncate">
                                            {index === 0 && (
                                                <span className="slds-icon_container slds-icon-utility-trophy slds-current-color" title="1st Place">
                                                    <svg className="slds-icon slds-icon_x-small slds-m-right_xx-small" aria-hidden="true" style={{fill: 'gold'}}>
                                                        <use href="/assets/icons/utility-sprite/svg/symbols.svg#trophy"></use>
                                                    </svg>
                                                </span>
                                            )}
                                            {index === 1 && (
                                                <span className="slds-icon_container slds-icon-utility-trophy slds-current-color" title="2nd Place">
                                                    <svg className="slds-icon slds-icon_x-small slds-m-right_xx-small" aria-hidden="true" style={{fill: 'silver'}}>
                                                        <use href="/assets/icons/utility-sprite/svg/symbols.svg#trophy"></use>
                                                    </svg>
                                                </span>
                                            )}
                                            {index === 2 && (
                                                <span className="slds-icon_container slds-icon-utility-trophy slds-current-color" title="3rd Place">
                                                    <svg className="slds-icon slds-icon_x-small slds-m-right_xx-small" aria-hidden="true" style={{fill: '#cd7f32'}}>
                                                        <use href="/assets/icons/utility-sprite/svg/symbols.svg#trophy"></use>
                                                    </svg>
                                                </span>
                                            )}
                                            <strong>#{index + 1}</strong>
                                        </div>
                                    </td>
                                    <td data-label="User">
                                        <div className="slds-truncate">
                                            {user.url ? (
                                                <a href={user.url} target="_blank" rel="noreferrer" title={user.username}>
                                                    {user.name || user.username}
                                                </a>
                                            ) : (
                                                <span title={user.username}>{user.name || user.username}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="slds-text-align_right" data-label="Points">
                                        <div className="slds-truncate">
                                            <span className="slds-badge">
                                                <span className="slds-badge__icon slds-badge__icon_left">
                                                    <span className="slds-icon_container slds-icon-utility-moneybag slds-current-color">
                                                        <svg className="slds-icon slds-icon_xx-small" aria-hidden="true">
                                                            <use href="/assets/icons/utility-sprite/svg/symbols.svg#moneybag"></use>
                                                        </svg>
                                                    </span>
                                                </span>
                                                {user.points.toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
