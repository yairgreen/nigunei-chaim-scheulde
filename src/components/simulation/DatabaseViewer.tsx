
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { getZmanimDatabase, getHolidaysDatabase } from '@/lib/database';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

/**
 * Database Viewer Component
 * 
 * Displays the contents of the application's database in a structured format.
 * This component is primarily used for debugging and development purposes.
 */
const DatabaseViewer = () => {
  const zmanimData = getZmanimDatabase();
  const holidaysData = getHolidaysDatabase();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">מאגר הנתונים</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="zmanim">
          <AccordionTrigger>
            <div className="flex items-center">
              <span>נתוני זמנים</span>
              <Badge variant="outline" className="mr-2">{zmanimData.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {zmanimData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>תאריך</TableHead>
                      <TableHead>הנץ</TableHead>
                      <TableHead>שקיעה</TableHead>
                      <TableHead>חצות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zmanimData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.sunrise}</TableCell>
                        <TableCell>{item.sunset}</TableCell>
                        <TableCell>{item.chatzot}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">אין נתונים זמינים</div>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="holidays">
          <AccordionTrigger>
            <div className="flex items-center">
              <span>נתוני חגים</span>
              <Badge variant="outline" className="mr-2">{holidaysData.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {holidaysData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>שם</TableHead>
                      <TableHead>שם עברי</TableHead>
                      <TableHead>תאריך</TableHead>
                      <TableHead>קטגוריה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidaysData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.hebrew}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">אין נתונים זמינים</div>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="raw">
          <AccordionTrigger>נתונים גולמיים (JSON)</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">זמנים</h3>
                <pre className="text-xs overflow-auto max-h-96 rtl:text-right ltr:text-left whitespace-pre-wrap">
                  {JSON.stringify(zmanimData, null, 2)}
                </pre>
              </div>
              
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">חגים</h3>
                <pre className="text-xs overflow-auto max-h-96 rtl:text-right ltr:text-left whitespace-pre-wrap">
                  {JSON.stringify(holidaysData, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              מידע מעודכן ל: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DatabaseViewer;
