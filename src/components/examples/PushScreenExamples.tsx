"use client";

import { Button } from "@/shared/ui";
import { usePushScreenActions } from "@/shared/hooks/usePushScreenActions";
import { usePushScreen } from "@/shared/contexts/PushScreenContext";
import { useState } from "react";

// Example content components
const ModalContent = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Modal Example</h2>
    <p className="text-gray-600 mb-4">
      This is a bottom modal opened using the push screen context.
    </p>
    <div className="space-y-2">
      <div className="bg-gray-100 p-3 rounded">Feature 1</div>
      <div className="bg-gray-100 p-3 rounded">Feature 2</div>
      <div className="bg-gray-100 p-3 rounded">Feature 3</div>
    </div>
  </div>
);

const SettingsContent = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Settings</h2>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>Notifications</span>
        <input type="checkbox" />
      </div>
      <div className="flex items-center justify-between">
        <span>Dark Mode</span>
        <input type="checkbox" />
      </div>
      <div className="flex items-center justify-between">
        <span>Auto-save</span>
        <input type="checkbox" />
      </div>
    </div>
  </div>
);

const FormContent = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Contact Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full p-2 border rounded"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full p-2 border rounded"
            placeholder="your.email@example.com"
          />
        </div>
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};

export function PushScreenExamples() {
  // Using the convenience hook
  const { openModal, openFullScreen, openBottomSheet, openSidebar } =
    usePushScreenActions();

  // Using the raw context for advanced control
  const { openPushScreen, closePushScreen, closeAllPushScreens, pushScreens } =
    usePushScreen();

  // State for tracking opened screens
  const [formScreenId, setFormScreenId] = useState<string | null>(null);

  // Example 1: Simple modal
  const handleOpenModal = () => {
    openModal(<ModalContent />);
  };

  // Example 2: Full screen with header
  const handleOpenSettings = () => {
    openFullScreen(<SettingsContent />, {
      title: "Settings",
      withHeader: true,
    });
  };

  // Example 3: Bottom sheet with custom height
  const handleOpenBottomSheet = () => {
    openBottomSheet(<ModalContent />, {
      height: "60vh",
    });
  };

  // Example 4: Sidebar
  const handleOpenSidebar = () => {
    openSidebar(<SettingsContent />, {
      title: "Quick Settings",
    });
  };

  // Example 5: Custom push screen with manual control
  const handleOpenCustomForm = () => {
    const id = openPushScreen({
      direction: "right",
      children: (
        <FormContent
          onSubmit={(data) => {
            console.log("Form submitted:", data);
            alert(`Thank you, ${data.name}! Form submitted successfully.`);
            if (formScreenId) {
              closePushScreen(formScreenId);
              setFormScreenId(null);
            }
          }}
        />
      ),
      title: "Contact Us",
      withHeader: true,
      fullScreen: false,
      height: "400px",
      onClose: () => {
        setFormScreenId(null);
      },
    });
    setFormScreenId(id);
  };

  // Example 6: Stacked modals
  const handleOpenStackedModals = () => {
    // First modal
    openBottomSheet(
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">First Modal</h2>
        <p className="mb-4">
          This is the first modal. Click the button below to open a second modal
          on top.
        </p>
        <Button
          onClick={() => {
            // Second modal on top
            openModal(
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">Second Modal</h2>
                <p className="mb-4">
                  This modal is stacked on top of the first one!
                </p>
                <Button
                  onClick={() => {
                    // Third modal!
                    openBottomSheet(
                      <div className="p-4">
                        <h2 className="text-lg font-bold mb-2">Third Modal</h2>
                        <p>Three modals deep! 🎉</p>
                      </div>,
                      { height: "30vh" }
                    );
                  }}
                >
                  Open Third Modal
                </Button>
              </div>
            );
          }}
        >
          Open Second Modal
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Push Screen Examples</h1>

      {/* Status display */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Currently open push screens: <strong>{pushScreens.length}</strong>
        </p>
        {pushScreens.length > 0 && (
          <Button
            variant="outline"
            onClick={closeAllPushScreens}
            className="mt-2 text-sm"
          >
            Close All Screens
          </Button>
        )}
      </div>

      {/* Example buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="font-semibold">Convenience Methods</h3>

          <Button
            onClick={handleOpenModal}
            variant="outline"
            className="w-full"
          >
            Open Modal
          </Button>

          <Button
            onClick={handleOpenBottomSheet}
            variant="outline"
            className="w-full"
          >
            Open Bottom Sheet
          </Button>

          <Button
            onClick={handleOpenSettings}
            variant="outline"
            className="w-full"
          >
            Open Full Screen
          </Button>

          <Button
            onClick={handleOpenSidebar}
            variant="outline"
            className="w-full"
          >
            Open Sidebar
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Advanced Examples</h3>

          <Button
            onClick={handleOpenCustomForm}
            variant="secondary"
            className="w-full"
          >
            Custom Form Modal
          </Button>

          <Button
            onClick={handleOpenStackedModals}
            variant="secondary"
            className="w-full"
          >
            Stacked Modals Demo
          </Button>

          <Button
            onClick={() => {
              openPushScreen({
                direction: "top",
                children: (
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Top Slide</h2>
                    <p>This slides down from the top!</p>
                  </div>
                ),
                fullScreen: false,
                height: "200px",
                withHeader: false,
              });
            }}
            variant="secondary"
            className="w-full"
          >
            Top Slide Modal
          </Button>

          <Button
            onClick={() => {
              openPushScreen({
                direction: "left",
                children: (
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Left Panel</h2>
                    <p>Navigation or menu content here.</p>
                  </div>
                ),
                fullScreen: false,
                height: "250px",
                title: "Navigation",
                withHeader: true,
              });
            }}
            variant="secondary"
            className="w-full"
          >
            Left Panel
          </Button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Usage Tips:</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>
            • Use <code>openModal()</code> for quick bottom modals
          </li>
          <li>
            • Use <code>openFullScreen()</code> for settings or detailed views
          </li>
          <li>
            • Use <code>openBottomSheet()</code> for partial overlays
          </li>
          <li>
            • Use raw <code>openPushScreen()</code> for complete control
          </li>
          <li>• Multiple push screens can be stacked</li>
          <li>• Each push screen gets a unique ID for tracking</li>
        </ul>
      </div>
    </div>
  );
}
