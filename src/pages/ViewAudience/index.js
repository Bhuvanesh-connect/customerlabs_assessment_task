import { useState } from 'react';
import { Button, Form, Offcanvas } from 'react-bootstrap';
import cx from 'classnames';
import { toast } from 'react-toastify';
import styles from './view_audience.module.scss';

const schemaOptions = [
    { label: "First Name", value: "first_name", trait: "user_trait" },
    { label: "Last Name", value: "last_name", trait: "user_trait" },
    { label: "Gender", value: "gender", trait: "user_trait" },
    { label: "Age", value: "age", trait: "user_trait" },
    { label: "Account Name", value: "account_name", trait: "group_trait" },
    { label: "City", value: "city", trait: "group_trait" },
    { label: "State", value: "state", trait: "group_trait" },
  ];

const ViewAudience = () => {
    const [show, setShowCanvas] = useState(false); 
    const [segmentNameInput, setSegmentNameInput] = useState(""); 
    const [selectedSchemaList, setSelectedSchemaList] = useState([]); 
    const [newSchema, setNewSchema] = useState(""); 

    const openCanvas = () => setShowCanvas(true);

    const closeCanvas = () => {
      resetAllInputs();
      setShowCanvas(false); 
    }

    const addNewSchema = () => { 
      if (newSchema && !selectedSchemaList.includes(newSchema)) {
         setSelectedSchemaList([...selectedSchemaList, newSchema]); 
         setNewSchema(""); 
        } 
    };  
    
    const removeSchema = (value) => {
      setSelectedSchemaList(selectedSchemaList.filter(s => s !== value));
    }

    const handleSchemaChange = (index, value) => { 
      const updated = [...selectedSchemaList]; 
      updated[index] = value; 
      setSelectedSchemaList(updated);
      setNewSchema("")
    };

    const resetAllInputs = () => {
      setSegmentNameInput("");
      setSelectedSchemaList([]);
    }

    const handleSubmit = async() => { 
      if (!segmentNameInput.trim()) { 
        toast.warning("Please enter the segment name to proceed.")
        return; 
      } 

      if (selectedSchemaList.length === 0) { 
        toast.warning("Please add atleast one schema to proceed.")
        return; 
      } 
      
      const formattedSchema = selectedSchemaList.map((schemaValue) => { 
        const schema = schemaOptions.find((option) => option.value === schemaValue); 
        return { 
          [schema.value]: schema.label 
        }; 
      }); 
      
      const payload = { 
        segment_name: segmentNameInput, 
        schema: formattedSchema, 
      };

      console.log('payload', payload)

      // Note - in the following attempting to submit directly to webhook.site from the browser, results in a CORS error. Hence, error pops up
      
      try {
        const response = await fetch("https://webhook.site/1afb8bb7-1028-4619-a2b2-f90039295aaf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to send data");

        toast.success("Segment data sent successfully!");
        closeCanvas()
      } catch (error) {
        console.error(error);
        toast.error("Failed to send data. Please try again.");
      }
    }

    const availableOptions = schemaOptions.filter( (option) => !selectedSchemaList.includes(option.value) );

  return (
    <div className={styles.ViewAudience}>
      <div className={styles.NavigationBar}>
        <h5>
          <span className={styles.icon_leftArrow}>
            <i className="bi bi-chevron-left"></i>
          </span> View Audience
        </h5>
      </div>

      <main className={styles.content}>
        <Button className={styles.btn_SaveSegment} onClick={()=>openCanvas()}>
          Save Segment
        </Button>

        <Offcanvas className={styles.SaveSegment} show={show} onHide={()=>closeCanvas()} backdrop="static" placement="end">
          <div className={styles.NavigationBar}>
            <h5>
              <span className={styles.icon_leftArrow} onClick={()=>closeCanvas()}>
                <i className="bi bi-chevron-left"></i>
              </span> Saving Segment
            </h5>
          </div>
          
          <Offcanvas.Body>
            <Form.Group className="mb-3">
              <Form.Label>Enter the Name of the Segment</Form.Label>
              <Form.Control 
                type="text" 
                className={styles.segmentNameInput} 
                placeholder="Name of the segment" 
                name="segment_name" 
                value={segmentNameInput} 
                onChange={(e)=>setSegmentNameInput(e.target.value)} 
                autoComplete="off"
              />
            </Form.Group>

            <p>To save your segment, you need to add the schemas to build the query</p>
            <div className={styles.legends}>
              <p><span className={cx(styles.dot, styles.green_dot)}></span><span> - User Traits</span></p> 
              <p><span className={cx(styles.dot, styles.red_dot)}></span><span> - Group Traits</span></p>
            </div>

            {selectedSchemaList.length > 0 && (
              <div className={cx(styles.schemaList, styles.blueBorder)}>
                {selectedSchemaList.map((schema, index) => (
                  <SchemaRow
                    key={index}
                    value={schema}
                    index={index}
                    schemaOptions={schemaOptions.filter(
                      (option) =>
                        !selectedSchemaList.includes(option.value) ||
                        option.value === schema
                    )}
                    onChange={(e, index) => handleSchemaChange(index, e.target.value)}
                    onRemove={removeSchema}
                  />
                ))}
              </div>
            )}
            {availableOptions && availableOptions.length > 0 &&
              <div className={styles.schemaList}>
                <SchemaRow
                  isAddRow
                  value={newSchema}
                  index={-1}
                  schemaOptions={availableOptions}
                  onChange={(e) => setNewSchema(e.target.value)}
                  onRemove={() => {}}
                />

                <Button className={styles.btn_addNewSchema} onClick={()=>addNewSchema()}>
                  + <span>Add new schema</span>
                </Button>
              </div>   
            }
          </Offcanvas.Body>
          
          <div className={styles.button_panel}>
            <Button className={styles.btn_SaveSegment} onClick={()=>handleSubmit()}>Save the Segment</Button>
            <Button className={styles.btn_Cancel} onClick={closeCanvas}>Cancel</Button>
          </div>
        </Offcanvas>
      </main>
    </div>
  )
}

const SchemaRow = ({value, index, schemaOptions, onChange, onRemove, isAddRow = false }) => {
  
  const traitType = schemaOptions.find((option) => option.value === value)?.trait;
  const dotColor = !value ? styles.grey_dot : traitType === 'user_trait' ? styles.green_dot : styles.red_dot;

  return (
    <div className={styles.schemaRow}>
      <div className={styles.coloredDotArea}>
        <span className={cx(styles.dot, dotColor)}></span>
      </div>

      <div className={styles.inputArea}>
        <Form.Select
          value={value}
          onChange={(e) => onChange(e, index)}
        >
          {isAddRow && <option value="" disabled hidden> Add schema to segment </option>}

          {schemaOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      </div>

      <div className={styles.buttonArea}>
        <Button
          className={styles.btnMinus}
          onClick={() => !isAddRow && onRemove(value)}
          disabled={isAddRow}
        >
          <i className="bi bi-dash-lg"></i>
        </Button>
      </div>
    </div>
  );
};

export default ViewAudience