import React from 'react';

const Settings = () => {
  const settingsOptions = [
    { id: 'genre', label: 'Genre' },
    { id: 'news', label: 'Current News' },
    { id: 'feature1', label: 'Feature 1' },
    { id: 'feature2', label: 'Feature 2' },
  ];

  return (
    <div className="settings p-4">
      <h2 className="text-2xl mb-4">Settings</h2>
      <ul>
        {settingsOptions.map(option => (
          <li key={option.id} className="mb-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" id={option.id} />
              <span>{option.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Settings;
